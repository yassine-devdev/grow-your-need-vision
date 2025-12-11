import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16', // Use a fixed API version
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'payment-server' });
});

// ==========================================
// PAYMENT INTENTS
// ==========================================

app.post('/api/payments/create-intent', async (req, res) => {
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
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/payments/confirm', async (req, res) => {
    try {
        const { payment_intent_id, payment_method_id } = req.body;

        const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
            payment_method: payment_method_id,
        });

        res.json(paymentIntent);
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// SUBSCRIPTIONS
// ==========================================

app.post('/api/payments/create-subscription', async (req, res) => {
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

        // 3. Map internal plan ID to Stripe Price ID
        // In a real app, you'd fetch this from DB or config
        const PLAN_PRICE_MAP = {
            'basic': 'price_basic_test_id', // REPLACE WITH REAL STRIPE PRICE IDS
            'pro': 'price_pro_test_id',
            'enterprise': 'price_enterprise_test_id'
        };

        const priceId = PLAN_PRICE_MAP[plan_id];
        if (!priceId) {
            throw new Error('Invalid plan ID');
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
            plan_name: plan_id, // Simplified
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
        });

    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/payments/cancel-subscription', async (req, res) => {
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
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// PAYMENT METHODS
// ==========================================

app.post('/api/payments/save-method', async (req, res) => {
    try {
        const { payment_method_id } = req.body;

        const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);

        res.json({
            id: paymentMethod.id,
            type: paymentMethod.type,
            card: paymentMethod.card,
            billing_details: paymentMethod.billing_details
        });
    } catch (error) {
        console.error('Error retrieving payment method:', error);
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

// Start server
app.listen(port, () => {
    console.log(`Payment server running at http://localhost:${port}`);
});
