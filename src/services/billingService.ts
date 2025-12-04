import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface Invoice extends RecordModel {
    tenantId: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue' | 'Void';
    due_date: string;
    paid_at?: string;
    items: InvoiceItem[];
}

export interface SubscriptionPlan extends RecordModel {
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    active: boolean;
}

export const billingService = {
    async getInvoices(filter?: string): Promise<Invoice[]> {
        try {
            console.log('Fetching invoices with filter:', filter);
            return await pb.collection('invoices').getFullList<Invoice>({
                filter: filter || '',
                sort: '-created',
                requestKey: null
            });
        } catch (error) {
            console.warn("Failed to fetch invoices", error);
            return [];
        }
    },

    async getRevenueStats(): Promise<{ mrr: number, totalRevenue: number }> {
        try {
            // 1. Total Revenue (Sum of all paid invoices)
            // Optimization: If we have too many, we should use a cloud function or separate stats collection.
            // For now, we fetch all PAID invoices (better than fetching ALL invoices).
            const allPaidInvoices = await this.getInvoices('status = "Paid"');
            const totalRevenue = allPaidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

            // 2. MRR (Last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().replace('T', ' ');

            // We can filter this from the already fetched 'allPaidInvoices' to save a request, 
            // OR make a specific request if we didn't fetch all.
            // Since we fetched all paid, let's filter in memory.
            const mrr = allPaidInvoices
                .filter(inv => new Date(inv.paid_at || inv.created) >= thirtyDaysAgo)
                .reduce((sum, inv) => sum + (inv.amount || 0), 0);

            return { mrr, totalRevenue };
        } catch (error) {
            console.error("Failed to calculate revenue stats", error);
            return { mrr: 0, totalRevenue: 0 };
        }
    },

    async getPlans(): Promise<SubscriptionPlan[]> {
        try {
            const plans = await pb.collection('subscription_plans').getFullList<SubscriptionPlan>({
                requestKey: null
            });
            // Sort in memory
            return plans.sort((a, b) => a.price - b.price);
        } catch (error) {
            console.warn("Failed to fetch plans", error);
            return [];
        }
    },

    async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
        return await pb.collection('invoices').create<Invoice>(data);
    }
};
