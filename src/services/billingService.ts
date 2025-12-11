import pb from '../lib/pocketbase';
import { Tenant } from './tenantService';

export interface Invoice {
    id: string;
    tenant: string;
    stripe_invoice_id: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed' | 'cancelled' | 'overdue';
    pdf_url?: string;
    period_start: string;
    period_end: string;
    paid_at?: string;
    created: string;
}

export interface BillingStats {
    mrr: number;
    arr: number;
    churn_rate: number;
    ltv: number;
    active_subscriptions: number;
    trial_subscriptions: number;
    failed_payments: number;
}

export const billingService = {
    // Invoice management
    getInvoices: async (tenantId?: string) => {
        const filter = tenantId ? `tenant = "${tenantId}"` : '';
        return await pb.collection('invoices').getList<Invoice>(1, 100, {
            filter,
            sort: '-created',
            expand: 'tenant'
        });
    },

    createInvoice: async (data: Omit<Invoice, 'id' | 'created'>) => {
        return await pb.collection('invoices').create(data);
    },

    updateInvoice: async (id: string, data: Partial<Invoice>) => {
        return await pb.collection('invoices').update(id, data);
    },

    // Billing statistics
    getBillingStats: async (): Promise<BillingStats> => {
        const activeTenants = await pb.collection('tenants').getFullList<Tenant>({
            filter: 'subscription_status = "active"'
        });

        const monthlyPrices: Record<string, number> = {
            free: 0,
            basic: 99,
            pro: 299,
            enterprise: 999
        };

        const mrr = activeTenants.reduce((total, tenant) => {
            return total + (monthlyPrices[tenant.plan] || 0);
        }, 0);

        const arr = mrr * 12;

        const trialTenants = await pb.collection('tenants').getList(1, 1, {
            filter: 'subscription_status = "trialing"'
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const failedPayments = await pb.collection('invoices').getList(1, 1, {
            filter: `status = "failed" && created >= "${thirtyDaysAgo.toISOString()}"`
        });

        const totalTenants = await pb.collection('tenants').getList(1, 1);
        const cancelledTenants = await pb.collection('tenants').getList(1, 1, {
            filter: 'status = "cancelled"'
        });
        const churn_rate = totalTenants.totalItems > 0
            ? (cancelledTenants.totalItems / totalTenants.totalItems) * 100
            : 0;

        const avgRevenuePerCustomer = activeTenants.length > 0 ? mrr / activeTenants.length : 0;
        const ltv = churn_rate > 0 ? (avgRevenuePerCustomer / (churn_rate / 100)) : avgRevenuePerCustomer * 36;

        return {
            mrr,
            arr,
            churn_rate,
            ltv,
            active_subscriptions: activeTenants.length,
            trial_subscriptions: trialTenants.totalItems,
            failed_payments: failedPayments.totalItems
        };
    },

    // Revenue over time
    getRevenueHistory: async () => {
        const months = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = date.toISOString();
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

            const invoices = await pb.collection('invoices').getList<Invoice>(1, 1000, {
                filter: `status = "paid" && paid_at >= "${monthStart}" && paid_at <= "${monthEnd}"`
            });

            const revenue = invoices.items.reduce((sum, inv) => sum + inv.amount, 0);

            months.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                revenue
            });
        }

        return months;
    }
};
