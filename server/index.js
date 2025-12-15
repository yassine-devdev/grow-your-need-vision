import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { logAudit } from './auditLogger.js';
import { storeReceipt } from './receiptService.js';
import PDFDocument from 'pdfkit';
import { randomUUID } from 'crypto';
import * as Sentry from '@sentry/node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Load environment variables
dotenv.config({ path: '../.env' });

// ----- Observability providers (optional) -----
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
        release: process.env.SENTRY_RELEASE,
    });
    console.log('Sentry initialized');
}

let otelSdk;
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    const otlpHeaders = {};
    if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
        // expected format: key1=val1,key2=val2
        process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',').forEach((pair) => {
            const [k, v] = pair.split('=');
            if (k && v) otlpHeaders[k.trim()] = v.trim();
        });
    }
    if (process.env.OTEL_EXPORTER_OTLP_AUTH_TOKEN) {
        otlpHeaders['Authorization'] = `Bearer ${process.env.OTEL_EXPORTER_OTLP_AUTH_TOKEN}`;
    }

    otelSdk = new NodeSDK({
        traceExporter: new OTLPTraceExporter({
            url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
            headers: otlpHeaders,
        }),
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: 'payment-server',
            [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
        }),
        instrumentations: [getNodeAutoInstrumentations()],
    });
    otelSdk.start().then(() => console.log('OpenTelemetry started')).catch((err) => console.error('OpenTelemetry failed to start', err));
}

const app = express();
const port = process.env.PORT || 3000;
const serviceApiKey = process.env.SERVICE_API_KEY;
const requireApiKey = (req, res, next) => {
    if (!serviceApiKey) {
        return res.status(500).json({ message: 'SERVICE_API_KEY not configured' });
    }
    const key = req.header('x-api-key');
    if (!key || key !== serviceApiKey) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

const requireTenant = (req, res, next) => {
    const tenantId = req.header('x-tenant-id');
    if (!tenantId) {
        return res.status(400).json({ message: 'Missing tenant id' });
    }
    req.tenantId = tenantId;
    next();
};

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16', // Use a fixed API version
});

const PB_URL = process.env.POCKETBASE_URL;
const PB_TOKEN = process.env.POCKETBASE_SERVICE_TOKEN;

const requireAdmin = (req, res, next) => {
    const role = req.header('x-user-role');
    if (role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

const requireTeacherOrAdmin = (req, res, next) => {
    const role = req.header('x-user-role');
    if (role === 'admin' || role === 'teacher' || role === 'Teacher') return next();
    return res.status(403).json({ message: 'Teacher or admin access required' });
};

// Simple in-memory request metrics with histogram buckets
const latencyBuckets = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]; // ms (histogram)
const requestMetrics = {
    counts: new Map(), // key => count
    durationsMs: new Map(), // key => total duration
    errors: new Map(), // key => error count
    latencyHistogram: new Map(), // key => bucket counts array
};

const processStartTimeSeconds = Math.floor(Date.now() / 1000);

const recordMetric = (key, durationMs, statusCode) => {
    requestMetrics.counts.set(key, (requestMetrics.counts.get(key) || 0) + 1);
    requestMetrics.durationsMs.set(key, (requestMetrics.durationsMs.get(key) || 0) + durationMs);
    if (statusCode >= 500) {
        requestMetrics.errors.set(key, (requestMetrics.errors.get(key) || 0) + 1);
    }
    if (!requestMetrics.latencyHistogram.has(key)) {
        requestMetrics.latencyHistogram.set(key, new Array(latencyBuckets.length + 1).fill(0)); // +Inf bucket
    }
    const buckets = requestMetrics.latencyHistogram.get(key);
    const idx = latencyBuckets.findIndex((b) => durationMs <= b);
    const bucketIndex = idx === -1 ? latencyBuckets.length : idx;
    buckets[bucketIndex] += 1;
};

async function pbList(collection, { filter, sort = '-created', expand, perPage = 50 }) {
    if (!PB_URL || !PB_TOKEN) throw new Error('PocketBase not configured');
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (sort) params.append('sort', sort);
    if (expand) params.append('expand', expand);
    params.append('perPage', String(perPage));
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records?${params.toString()}`, {
        headers: {
            'Authorization': PB_TOKEN.startsWith('Bearer ') ? PB_TOKEN : `Bearer ${PB_TOKEN}`
        }
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PocketBase list ${collection} failed: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json?.items || [];
}

async function pbListPage(collection, { filter, sort = '-created', expand, page = 1, perPage = 20 }) {
    if (!PB_URL || !PB_TOKEN) throw new Error('PocketBase not configured');
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (sort) params.append('sort', sort);
    if (expand) params.append('expand', expand);
    params.append('page', String(page));
    params.append('perPage', String(perPage));
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records?${params.toString()}`, {
        headers: {
            'Authorization': PB_TOKEN.startsWith('Bearer ') ? PB_TOKEN : `Bearer ${PB_TOKEN}`
        }
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PocketBase list ${collection} failed: ${res.status} ${text}`);
    }
    return res.json();
}

async function pbListAll(collection, { filter, sort = '-created', expand, perPage = 200 }) {
    const first = await pbListPage(collection, { filter, sort, expand, page: 1, perPage });
    let items = first?.items || [];
    const totalPages = first?.totalPages || 1;
    for (let page = 2; page <= totalPages; page++) {
        const res = await pbListPage(collection, { filter, sort, expand, page, perPage });
        if (res?.items?.length) items = items.concat(res.items);
    }
    return items;
}

async function pbCreate(collection, body) {
    if (!PB_URL || !PB_TOKEN) throw new Error('PocketBase not configured');
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
        method: 'POST',
        headers: {
            'Authorization': PB_TOKEN.startsWith('Bearer ') ? PB_TOKEN : `Bearer ${PB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PocketBase create ${collection} failed: ${res.status} ${text}`);
    }
    return res.json();
}

async function pbUpdate(collection, id, body) {
    if (!PB_URL || !PB_TOKEN) throw new Error('PocketBase not configured');
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records/${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': PB_TOKEN.startsWith('Bearer ') ? PB_TOKEN : `Bearer ${PB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PocketBase update ${collection} failed: ${res.status} ${text}`);
    }
    return res.json();
}

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.requestHandler());
}

// Observability: add request id + per-route latency and structured log
app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    const reqId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', reqId);
    res.locals.reqId = reqId;
    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const key = `${req.method} ${req.path}`;
        recordMetric(key, durationMs, res.statusCode);
        if (durationMs > 1000) {
            console.warn(JSON.stringify({ level: 'warn', type: 'slow_request', reqId, method: req.method, path: req.path, status: res.statusCode, durationMs: Number(durationMs.toFixed(1)) }));
        } else {
            console.log(JSON.stringify({ level: 'info', type: 'request', reqId, method: req.method, path: req.path, status: res.statusCode, durationMs: Number(durationMs.toFixed(1)) }));
        }
    });
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'payment-server',
        stripe: !!process.env.STRIPE_SECRET_KEY,
        pocketbase: !!process.env.POCKETBASE_URL && !!process.env.POCKETBASE_SERVICE_TOKEN,
        uptimeSeconds: Math.floor(process.uptime()),
        metrics: {
            routes: Array.from(requestMetrics.counts.entries()).map(([route, count]) => {
                const totalMs = requestMetrics.durationsMs.get(route) || 0;
                const avg = count ? totalMs / count : 0;
                const errors = requestMetrics.errors.get(route) || 0;
                return { route, count, avgMs: Number(avg.toFixed ? avg.toFixed(2) : avg), errors };
            })
        }
    });
});

// Prometheus-style metrics endpoint (plaintext exposition)
app.get('/api/metrics', (req, res) => {
    const lines = [];
    lines.push('# HELP http_requests_total Total HTTP requests');
    lines.push('# TYPE http_requests_total counter');
    requestMetrics.counts.forEach((count, route) => {
        const [method, path] = route.split(' ');
        lines.push(`http_requests_total{method="${method}",path="${path}"} ${count}`);
    });

    lines.push('# HELP http_request_duration_ms_sum Total duration of HTTP requests in ms');
    lines.push('# TYPE http_request_duration_ms_sum counter');
    requestMetrics.durationsMs.forEach((sum, route) => {
        const [method, path] = route.split(' ');
        lines.push(`http_request_duration_ms_sum{method="${method}",path="${path}"} ${sum}`);
    });

    lines.push('# HELP http_request_duration_ms_bucket Histogram of HTTP request durations in ms');
    lines.push('# TYPE http_request_duration_ms_bucket histogram');
    requestMetrics.latencyHistogram.forEach((buckets, route) => {
        const [method, path] = route.split(' ');
        let cumulative = 0;
        buckets.forEach((count, idx) => {
            cumulative += count;
            const le = idx < latencyBuckets.length ? latencyBuckets[idx] : '+Inf';
            lines.push(`http_request_duration_ms_bucket{method="${method}",path="${path}",le="${le}"} ${cumulative}`);
        });
    });

    lines.push('# HELP http_request_errors_total HTTP 5xx responses');
    lines.push('# TYPE http_request_errors_total counter');
    requestMetrics.errors.forEach((count, route) => {
        const [method, path] = route.split(' ');
        lines.push(`http_request_errors_total{method="${method}",path="${path}"} ${count}`);
    });

    lines.push('# HELP process_uptime_seconds Process uptime in seconds');
    lines.push('# TYPE process_uptime_seconds gauge');
    lines.push(`process_uptime_seconds ${Math.floor(process.uptime())}`);

    lines.push('# HELP process_start_time_seconds Start time of the process since unix epoch in seconds');
    lines.push('# TYPE process_start_time_seconds gauge');
    lines.push(`process_start_time_seconds ${processStartTimeSeconds}`);

    res.setHeader('Content-Type', 'text/plain');
    res.send(lines.join('\n'));
});

// ==========================================
// PAYMENT INTENTS
// ==========================================

app.post('/api/payments/create-intent', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { amount, currency, description, metadata, receipt_email } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            description,
            metadata,
            receipt_email,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            payment_intent_id: paymentIntent.id,
            client_secret: paymentIntent.client_secret,
        });
        await logAudit({
            action: 'payment.intent.create',
            resourceType: 'payment_intent',
            resourceId: paymentIntent.id,
            tenantId: req.tenantId,
            metadata: { amount, currency, description }
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/payments/confirm', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { payment_intent_id, payment_method_id } = req.body;

        const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
            payment_method: payment_method_id,
        });

        res.json(paymentIntent);

        // Generate receipt on succeeded intents
        if (paymentIntent.status === 'succeeded') {
            await storeReceipt({
                invoiceId: paymentIntent.invoice || null,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount_received,
                currency: paymentIntent.currency,
                tenantId: req.tenantId,
                payerEmail: paymentIntent.receipt_email,
                method: paymentIntent.payment_method_types?.[0],
                reference: paymentIntent.charges?.data?.[0]?.id,
                metadata: paymentIntent.metadata || {}
            });
        }

        await logAudit({
            action: 'payment.intent.confirm',
            resourceType: 'payment_intent',
            resourceId: paymentIntent.id,
            tenantId: req.tenantId,
            metadata: { status: paymentIntent.status }
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// SUBSCRIPTIONS
// ==========================================

app.post('/api/payments/create-subscription', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { email, payment_method_id, plan_id, user_id } = req.body;

        // 1. Create or get customer
        let customer;
        const existingCustomers = await stripe.customers.list({ email, limit: 1 });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email,
                payment_method: payment_method_id,
                invoice_settings: {
                    default_payment_method: payment_method_id,
                },
                metadata: {
                    userId: user_id
                }
            });
        }

        // 2. Attach payment method if provided and new
        if (payment_method_id) {
            try {
                await stripe.paymentMethods.attach(payment_method_id, {
                    customer: customer.id,
                });

                // Set as default if needed
                await stripe.customers.update(customer.id, {
                    invoice_settings: {
                        default_payment_method: payment_method_id,
                    },
                });
            } catch (e) {
                // Ignore if already attached
                console.log('Payment method attachment note:', e.message);
            }
        }

        const priceId = process.env[`STRIPE_PRICE_${String(plan_id).toUpperCase()}`];
        if (!priceId) {
            throw new Error('Invalid plan ID or price not configured');
        }

        // 4. Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                userId: user_id,
                planId: plan_id
            }
        });

        res.json({
            subscription_id: subscription.id,
            customer_id: customer.id,
            client_secret: subscription.latest_invoice.payment_intent?.client_secret,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_name: plan_id,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
        });

        await logAudit({
            action: 'subscription.create',
            resourceType: 'subscription',
            resourceId: subscription.id,
            tenantId: req.tenantId,
            metadata: { plan_id: plan_id, customer: customer.id }
        });

    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/payments/cancel-subscription', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { subscription_id, cancel_at_period_end } = req.body;

        let subscription;
        if (cancel_at_period_end) {
            subscription = await stripe.subscriptions.update(subscription_id, {
                cancel_at_period_end: true
            });
        } else {
            subscription = await stripe.subscriptions.cancel(subscription_id);
        }

        res.json({
            id: subscription.id,
            status: subscription.status,
            canceled_at: subscription.canceled_at
        });
        await logAudit({
            action: 'subscription.cancel',
            resourceType: 'subscription',
            resourceId: subscription.id,
            tenantId: req.tenantId,
            metadata: { cancel_at_period_end }
        });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// PAYMENT METHODS
// ==========================================

app.post('/api/payments/save-method', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { payment_method_id } = req.body;

        const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);

        res.json({
            id: paymentMethod.id,
            type: paymentMethod.type,
            card: paymentMethod.card,
            billing_details: paymentMethod.billing_details
        });
        await logAudit({
            action: 'payment.method.save',
            resourceType: 'payment_method',
            resourceId: paymentMethod.id,
            tenantId: req.tenantId,
            metadata: { type: paymentMethod.type }
        });
    } catch (error) {
        console.error('Error retrieving payment method:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// PAYMENT HISTORY & INVOICES (PocketBase passthrough)
// ==========================================

// Tenant admin updates
app.post('/api/admin/tenants/:id', requireApiKey, requireAdmin, async (req, res) => {
    try {
        const updated = await pbUpdate('tenants', req.params.id, req.body || {});
        await logAudit({ action: 'tenant.update', resourceType: 'tenant', resourceId: req.params.id, tenantId: req.params.id, metadata: { keys: Object.keys(req.body || {}) }, userId: req.header('x-user-id') || 'admin' });
        res.json(updated);
    } catch (error) {
        console.error('Error updating tenant:', error);
        res.status(500).json({ message: error.message });
    }
});

// Assume admin (stub token)
app.post('/api/admin/tenants/:id/assume', requireApiKey, requireAdmin, async (req, res) => {
    try {
        const token = Buffer.from(`${req.params.id}:${Date.now()}`).toString('base64');
        await logAudit({ action: 'tenant.assume', resourceType: 'tenant', resourceId: req.params.id, tenantId: req.params.id, metadata: {}, userId: req.header('x-user-id') || 'admin' });
        res.json({ assumeToken: token, expiresIn: 900 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DNS verify (stub)
app.post('/api/admin/tenants/:id/verify-dns', requireApiKey, requireAdmin, async (req, res) => {
    try {
        const { domain } = req.body || {};
        if (!domain) return res.status(400).json({ message: 'domain required' });
        await logAudit({ action: 'tenant.verify_dns', resourceType: 'tenant', resourceId: req.params.id, tenantId: req.params.id, metadata: { domain }, userId: req.header('x-user-id') || 'admin' });
        // Stubbed response
        res.json({ domain, status: 'pending', requiredRecord: `CNAME ${domain} -> app.growyourneed.com` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Support ticket create
app.post('/api/admin/tenants/:id/tickets', requireApiKey, async (req, res) => {
    try {
        const { subject, description, priority = 'Medium', category = 'Other' } = req.body || {};
        if (!subject || !description) return res.status(400).json({ message: 'subject and description required' });
        const ticket = await pbCreate('tickets', {
            subject,
            description,
            priority,
            status: 'Open',
            category,
            tenantId: req.params.id,
            created_by: req.header('x-user-id') || 'admin'
        });
        await logAudit({ action: 'ticket.create', resourceType: 'ticket', resourceId: ticket.id, tenantId: req.params.id, userId: req.header('x-user-id') || 'admin' });
        res.json(ticket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/payments/history', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { userId, limit } = req.query;
        const filters = [`tenantId = "${req.tenantId}"`];
        if (userId) filters.push(`user = "${userId}"`);
        const filter = filters.join(' && ');
        const items = await pbList('payment_intents', { filter, sort: '-created', perPage: Number(limit) || 50 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/payments/invoices', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { userId, limit } = req.query;
        const filters = [`tenantId = "${req.tenantId}"`];
        if (userId) filters.push(`user = "${userId}"`);
        const filter = filters.join(' && ');
        const items = await pbList('invoices', { filter, sort: '-created', expand: 'user', perPage: Number(limit) || 50 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// SCHOOL FINANCE SUMMARY (PocketBase passthrough, tenant scoped)
// ==========================================

app.get('/api/school/finance/summary', requireApiKey, requireTenant, async (req, res) => {
    try {
        const tenantFilter = `tenantId = "${req.tenantId}"`;

        const [paidInvoices, pendingInvoices, expenses, payroll] = await Promise.all([
            pbList('school_invoices', { filter: `${tenantFilter} && status = "Paid"`, perPage: 200 }),
            pbList('school_invoices', { filter: `${tenantFilter} && (status = "Pending" || status = "Overdue")`, perPage: 200 }),
            pbList('expenses', { filter: `${tenantFilter} && status = "Approved"`, perPage: 200 }),
            pbList('payroll', { filter: `${tenantFilter} && status = "Paid"`, perPage: 200 })
        ]);

        const sum = (items, field = 'amount') => items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);

        const totalRevenue = sum(paidInvoices, 'amount');
        const outstanding = sum(pendingInvoices, 'amount');
        const totalExpenses = sum(expenses, 'amount') + sum(payroll, 'amount');
        const netIncome = totalRevenue - totalExpenses;

        res.json({ totalRevenue, outstanding, totalExpenses, netIncome });
    } catch (error) {
        console.error('Error fetching finance summary:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// SCHOOL FINANCE - INVOICES (secured, paginated + export)
// ==========================================

app.get('/api/school/finance/invoices', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { page = 1, perPage = 20, search = '', status, sort = '-created', dueFrom, dueTo, studentName, feeName } = req.query;
        const filters = [`tenantId = "${req.tenantId}"`];
        if (status) filters.push(`status = "${status}"`);
        if (dueFrom) filters.push(`due_date >= "${String(dueFrom).replace(/"/g, '\\"')}"`);
        if (dueTo) filters.push(`due_date <= "${String(dueTo).replace(/"/g, '\\"')}"`);
        if (studentName) {
            const safe = String(studentName).replace(/"/g, '\\"');
            filters.push(`student.name ~ "${safe}"`);
        }
        if (feeName) {
            const safe = String(feeName).replace(/"/g, '\\"');
            filters.push(`fee.name ~ "${safe}"`);
        }
        if (search) {
            const safe = String(search).replace(/"/g, '\\"');
            filters.push(`(status ~ "${safe}" || id ~ "${safe}" || fee ~ "${safe}" || student.name ~ "${safe}" || fee.name ~ "${safe}")`);
        }
        const filter = filters.join(' && ');
        const result = await pbListPage('school_invoices', {
            filter,
            sort: String(sort),
            expand: 'student,fee',
            page: Number(page) || 1,
            perPage: Number(perPage) || 20,
        });
        res.json(result);
    } catch (error) {
        console.error('Error fetching school invoices:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/school/finance/invoices/export', requireApiKey, requireTenant, requireAdmin, async (req, res) => {
    try {
        const { search = '', status, sort = '-created', dueFrom, dueTo, studentName, feeName } = req.query;
        const filters = [`tenantId = "${req.tenantId}"`];
        if (status) filters.push(`status = "${status}"`);
        if (dueFrom) filters.push(`due_date >= "${String(dueFrom).replace(/"/g, '\\"')}"`);
        if (dueTo) filters.push(`due_date <= "${String(dueTo).replace(/"/g, '\\"')}"`);
        if (studentName) {
            const safe = String(studentName).replace(/"/g, '\\"');
            filters.push(`student.name ~ "${safe}"`);
        }
        if (feeName) {
            const safe = String(feeName).replace(/"/g, '\\"');
            filters.push(`fee.name ~ "${safe}"`);
        }
        if (search) {
            const safe = String(search).replace(/"/g, '\\"');
            filters.push(`(status ~ "${safe}" || id ~ "${safe}" || fee ~ "${safe}" || student.name ~ "${safe}" || fee.name ~ "${safe}")`);
        }
        const filter = filters.join(' && ');
        const items = await pbListAll('school_invoices', {
            filter,
            sort: String(sort),
            expand: 'student,fee',
            perPage: 200,
        });

        const rows = [
            ['id', 'student', 'student_name', 'fee', 'fee_name', 'amount', 'status', 'due_date', 'created'],
            ...items.map((inv) => [
                inv.id,
                inv.student,
                inv.expand?.student?.name || '',
                inv.fee,
                inv.expand?.fee?.name || '',
                inv.amount,
                inv.status,
                inv.due_date,
                inv.created,
            ])
        ];

        const csv = rows.map(r => r.map(v => typeof v === 'string' ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="school-invoices.csv"');
        res.send(csv);

        await logAudit({
            action: 'invoice.export.csv',
            resourceType: 'invoice',
            resourceId: 'bulk',
            tenantId: req.tenantId,
            userId: req.header('x-user-id') || 'admin',
            metadata: { count: items.length, filters }
        });
    } catch (error) {
        console.error('Error exporting school invoices:', error);
        res.status(500).json({ message: error.message });
    }
});

// Billing invoices fetch (tenant scoped)
app.get('/api/admin/billing/invoices', requireApiKey, requireAdmin, async (req, res) => {
    try {
        const { tenantId } = req.query;
        const filter = tenantId ? `tenantId = "${tenantId}"` : '';
        const items = await pbList('billing_invoices', { filter, sort: '-created', perPage: 50 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching billing invoices:', error);
        res.status(500).json({ message: error.message });
    }
});

// Billing invoice download stub (would fetch file URL)
app.get('/api/admin/billing/invoices/:id/download', requireApiKey, requireAdmin, async (req, res) => {
    try {
        const invoice = await pbList('billing_invoices', { filter: `id = "${req.params.id}"`, perPage: 1 });
        if (!invoice?.[0]) return res.status(404).json({ message: 'Not found' });
        const csv = `id,amount,status\n${invoice[0].id},${invoice[0].amount},${invoice[0].status}`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="billing-invoice-${req.params.id}.csv"`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Bulk reminders
app.post('/api/school/finance/invoices/reminders', requireApiKey, requireTenant, requireAdmin, async (req, res) => {
    try {
        const { invoiceIds = [], channels = { email: true, sms: false, inApp: true }, message, throttleSeconds = 30 } = req.body || {};
        if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({ message: 'invoiceIds required' });
        }
        const now = new Date().toISOString();
        // Persist reminder request for auditing; actual channel delivery would be handled by downstream worker
        for (const id of invoiceIds) {
            await logAudit({
                action: 'invoice.reminder',
                resourceType: 'invoice',
                resourceId: id,
                tenantId: req.tenantId,
                userId: req.header('x-user-id') || 'admin',
                metadata: { channels, message: message?.slice(0, 500), throttleSeconds, timestamp: now }
            });
        }
        res.json({ ok: true, queued: invoiceIds.length, channels, throttleSeconds });
    } catch (error) {
        console.error('Error sending reminders:', error);
        res.status(500).json({ message: error.message });
    }
});

// Upload external payment proof (URL + note)
app.post('/api/school/finance/invoices/:id/proof', requireApiKey, requireTenant, requireAdmin, async (req, res) => {
    try {
        const { proofUrl, note } = req.body || {};
        if (!proofUrl) return res.status(400).json({ message: 'proofUrl required' });
        await logAudit({
            action: 'invoice.proof.upload',
            resourceType: 'invoice',
            resourceId: req.params.id,
            tenantId: req.tenantId,
            userId: req.header('x-user-id') || 'admin',
            metadata: { proofUrl, note }
        });
        // Optionally persist to PocketBase if collection exists
        try {
            await pbCreate('payment_proofs', { invoice: req.params.id, proof_url: proofUrl, note, tenantId: req.tenantId });
        } catch (err) {
            console.warn('payment_proofs collection missing or PB not configured', err?.message);
        }
        res.json({ ok: true });
    } catch (error) {
        console.error('Error uploading payment proof:', error);
        res.status(500).json({ message: error.message });
    }
});

// PDF receipt generation
app.get('/api/school/finance/invoices/:id/receipt.pdf', requireApiKey, requireTenant, requireAdmin, async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const itemRes = await pbListPage('school_invoices', { filter: `id = "${invoiceId}" && tenantId = "${req.tenantId}"`, perPage: 1, expand: 'student,fee' });
        const invoice = itemRes?.items?.[0];
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
        doc.pipe(res);
        doc.fontSize(18).text('Invoice Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice ID: ${invoice.id}`);
        doc.text(`Student: ${invoice.expand?.student?.name || invoice.student}`);
        doc.text(`Fee: ${invoice.expand?.fee?.name || invoice.fee}`);
        doc.text(`Amount: ${invoice.amount}`);
        doc.text(`Status: ${invoice.status}`);
        doc.text(`Due Date: ${invoice.due_date}`);
        doc.text(`Generated: ${new Date().toISOString()}`);
        doc.end();

        await logAudit({
            action: 'invoice.receipt.pdf',
            resourceType: 'invoice',
            resourceId: invoiceId,
            tenantId: req.tenantId,
            userId: req.header('x-user-id') || 'admin',
            metadata: { amount: invoice.amount, status: invoice.status }
        });
    } catch (error) {
        console.error('Error generating receipt PDF:', error);
        if (!res.headersSent) res.status(500).json({ message: error.message });
    }
});

// Student autocomplete
app.get('/api/school/finance/students/search', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { term = '' } = req.query;
        const safe = String(term).replace(/"/g, '\\"');
        const items = await pbListPage('students', {
            filter: `tenantId = "${req.tenantId}" && name ~ "${safe}"`,
            perPage: 10,
            sort: 'name'
        });
        res.json(items?.items || []);
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({ message: error.message });
    }
});

// Attendance exports and aggregates (teacher/admin)
app.get('/api/school/attendance/export', requireApiKey, requireTenant, requireTeacherOrAdmin, async (req, res) => {
    try {
        const { classId, date } = req.query;
        if (!classId || !date) return res.status(400).json({ message: 'classId and date required' });
        const start = `${date} 00:00:00`;
        const end = `${date} 23:59:59`;
        const records = await pbList('attendance_records', {
            filter: `class = "${classId}" && date >= "${start}" && date <= "${end}" && tenantId = "${req.tenantId}"`,
            perPage: 200,
            expand: 'student'
        });
        const rows = [['student_id', 'student_name', 'status', 'date'], ...records.map(r => [r.student, r.expand?.student?.name || '', r.status, r.date])];
        const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="attendance-${classId}-${date}.csv"`);
        res.send(csv);
        await logAudit({ action: 'attendance.export', resourceType: 'attendance', resourceId: classId, tenantId: req.tenantId, userId: req.header('x-user-id') || 'teacher', metadata: { date } });
    } catch (error) {
        console.error('Error exporting attendance:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/school/attendance/aggregates', requireApiKey, requireTenant, requireTeacherOrAdmin, async (req, res) => {
    try {
        const { classId, from, to } = req.query;
        if (!classId || !from || !to) return res.status(400).json({ message: 'classId, from, to required' });
        const records = await pbList('attendance_records', {
            filter: `class = "${classId}" && date >= "${from}" && date <= "${to}" && tenantId = "${req.tenantId}"`,
            perPage: 500,
        });
        const counts = records.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        }, {});
        res.json({ total: records.length, counts });
    } catch (error) {
        console.error('Error fetching attendance aggregates:', error);
        res.status(500).json({ message: error.message });
    }
});

// People export (admin)
app.get('/api/school/people/export', requireApiKey, requireTenant, requireAdmin, async (req, res) => {
    try {
        const { role = 'Student' } = req.query;
        const items = await pbListAll('users', { filter: `tenantId = "${req.tenantId}" && role = "${role}"`, sort: 'name' });
        const rows = [['id', 'name', 'email', 'role', 'verified'], ...items.map(u => [u.id, u.name, u.email, u.role, u.verified])];
        const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="people-${role}.csv"`);
        res.send(csv);
        await logAudit({ action: 'people.export', resourceType: 'user', resourceId: 'bulk', tenantId: req.tenantId, userId: req.header('x-user-id') || 'admin', metadata: { role, count: items.length } });
    } catch (error) {
        console.error('Error exporting people:', error);
        res.status(500).json({ message: error.message });
    }
});

// Services export (admin)
app.get('/api/school/services/export', requireApiKey, requireTenant, requireAdmin, async (req, res) => {
    try {
        const services = await pbListAll('school_services', { filter: `tenantId = "${req.tenantId}"`, sort: 'name' });
        const rows = [['id', 'name', 'category', 'price', 'duration_minutes'], ...services.map(s => [s.id, s.name, s.category, s.price, s.duration_minutes])];
        const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="services.csv"');
        res.send(csv);
        await logAudit({ action: 'services.export', resourceType: 'service', resourceId: 'bulk', tenantId: req.tenantId, userId: req.header('x-user-id') || 'admin', metadata: { count: services.length } });
    } catch (error) {
        console.error('Error exporting services:', error);
        res.status(500).json({ message: error.message });
    }
});

// Audit logs (admin)
app.get('/api/admin/audit', requireApiKey, requireTenant, requireAdmin, async (req, res) => {
    try {
        const { page = 1, perPage = 50, action, userId, from, to, severity } = req.query;
        const filters = [`tenant_id = "${req.tenantId}"`];
        if (action) filters.push(`action ~ "${action}"`);
        if (userId) filters.push(`user_id = "${userId}"`);
        if (severity) filters.push(`severity = "${severity}"`);
        if (from) filters.push(`timestamp >= "${from}"`);
        if (to) filters.push(`timestamp <= "${to}"`);
        const filter = filters.join(' && ');
        const result = await pbListPage('audit_logs', {
            filter,
            sort: '-timestamp',
            page: Number(page) || 1,
            perPage: Number(perPage) || 50
        });
        res.json(result);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/audit/export', requireApiKey, requireTenant, requireAdmin, async (req, res) => {
    try {
        const { action, userId, from, to, severity } = req.query;
        const filters = [`tenant_id = "${req.tenantId}"`];
        if (action) filters.push(`action ~ "${action}"`);
        if (userId) filters.push(`user_id = "${userId}"`);
        if (severity) filters.push(`severity = "${severity}"`);
        if (from) filters.push(`timestamp >= "${from}"`);
        if (to) filters.push(`timestamp <= "${to}"`);
        const filter = filters.join(' && ');
        const items = await pbListAll('audit_logs', { filter, sort: '-timestamp', perPage: 200 });
        const rows = [['timestamp', 'action', 'resource_type', 'resource_id', 'user_id', 'severity', 'metadata'], ...items.map(i => [i.timestamp, i.action, i.resource_type, i.resource_id, i.user_id, i.severity, JSON.stringify(i.metadata || {})])];
        const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// SCHOOL FINANCE - EXPENSES (secured)
// ==========================================

app.post('/api/school/finance/expenses', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { title, amount, category, date, status } = req.body;
        if (!title || amount == null || !category || !date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const payload = {
            title,
            amount,
            category,
            date,
            status: status || 'Pending',
            tenantId: req.tenantId
        };
        const created = await pbCreate('expenses', payload);
        res.json(created);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/school/finance/expenses/:id/status', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['Pending', 'Approved', 'Rejected'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const updated = await pbUpdate('expenses', req.params.id, { status });
        res.json(updated);
    } catch (error) {
        console.error('Error updating expense status:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/school/finance/expenses', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { page = 1, perPage = 50, search } = req.query;
        const filters = [`tenantId = "${req.tenantId}"`];
        if (search) {
            filters.push(`title ~ "${search}" || category ~ "${search}"`);
        }
        const filter = filters.join(' && ');
        const items = await pbList('expenses', {
            filter,
            sort: '-date',
            perPage: Number(perPage) || 50
        });
        res.json(items);
    } catch (error) {
        console.error('Error listing expenses:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// SCHOOL FINANCE - PAYROLL (secured)
// ==========================================

app.post('/api/school/finance/payroll/run', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { month } = req.body;
        if (!month) return res.status(400).json({ message: 'Month is required (YYYY-MM)' });

        const roleFilter = '(role = "Teacher" || role = "Staff" || role = "Admin")';
        const staff = await pbList('users', {
            filter: `${roleFilter} && tenantId = "${req.tenantId}"`,
            perPage: 200
        });

        let created = 0;
        for (const s of staff) {
            const existing = await pbList('payroll', {
                filter: `staff = "${s.id}" && month = "${month}" && tenantId = "${req.tenantId}"`,
                perPage: 1
            });
            if (existing.length === 0) {
                await pbCreate('payroll', {
                    staff: s.id,
                    month,
                    amount: s.salary || 3000,
                    status: 'Pending',
                    tenantId: req.tenantId
                });
                created++;
            }
        }

        res.json({ created });
    } catch (error) {
        console.error('Error running payroll:', error);
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/school/finance/payroll/:id/status', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['Pending', 'Paid'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const body = { status };
        if (status === 'Paid') {
            body.paid_at = new Date().toISOString();
        }
        const updated = await pbUpdate('payroll', req.params.id, body);
        res.json(updated);
    } catch (error) {
        console.error('Error updating payroll status:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/school/finance/payroll', requireApiKey, requireTenant, async (req, res) => {
    try {
        const { page = 1, perPage = 50, search } = req.query;
        const filters = [`tenantId = "${req.tenantId}"`];
        if (search) {
            filters.push(`month ~ "${search}"`);
        }
        const filter = filters.join(' && ');
        const items = await pbList('payroll', {
            filter,
            sort: '-created',
            expand: 'staff',
            perPage: Number(perPage) || 50
        });
        res.json(items);
    } catch (error) {
        console.error('Error listing payroll:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// WEBHOOKS
// ==========================================

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature in production
        if (process.env.NODE_ENV === 'production' && !endpointSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing in production');
        }

        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            // Only allow unverified webhooks in development
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Webhook signature verification failed');
            }
            event = req.body;
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('PaymentIntent was successful!', paymentIntent.id);
                // TODO: Update database status via PocketBase API or direct DB access
                break;
            case 'invoice.payment_succeeded':
                const invoice = event.data.object;
                console.log('Invoice payment succeeded!', invoice.id);
                break;
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                const subscription = event.data.object;
                console.log('Subscription status update:', subscription.id, subscription.status);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error('Error processing webhook event:', error);
        // Return 200 to Stripe to prevent retries if it's an application error
        // Return 500 if you want Stripe to retry
        res.status(500).send('Error processing event');
        return;
    }

    res.send();
});

if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
}

// Start server
app.listen(port, () => {
    console.log(`Payment server running at http://localhost:${port}`);
});
