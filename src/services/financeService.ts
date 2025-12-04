import pb from '../lib/pocketbase';
import { Fee, Invoice, Student } from '../apps/school/types';
import { RecordModel } from 'pocketbase';

export interface Expense extends RecordModel {
    category: string;
    amount: number;
    date: string;
    description: string;
    approved_by: string;
}

export const financeService = {
    /**
     * Get all fee structures
     */
    async getFees() {
        return await pb.collection('fees').getFullList<Fee>({
            sort: 'name',
            requestKey: null
        });
    },

    /**
     * Create a new fee structure
     */
    async createFee(data: Partial<Fee>) {
        return await pb.collection('fees').create(data);
    },

    /**
     * Delete a fee structure
     */
    async deleteFee(id: string) {
        return await pb.collection('fees').delete(id);
    },

    /**
     * Get all invoices
     */
    async getInvoices(filter?: string) {
        return await pb.collection('invoices').getFullList<Invoice>({
            filter: filter || '',
            expand: 'student,fee',
            sort: '-created',
            requestKey: null
        });
    },

    /**
     * Create a single invoice
     */
    async createInvoice(data: Partial<Invoice>) {
        return await pb.collection('invoices').create(data);
    },

    /**
     * Update invoice status
     */
    async updateInvoiceStatus(id: string, status: Invoice['status']) {
        return await pb.collection('invoices').update(id, { status });
    },

    /**
     * Generate invoices for a specific fee for all students in a class
     */
    async generateInvoicesForClass(classId: string, feeId: string) {
        // 1. Get all students in the class
        const enrollments = await pb.collection('enrollments').getFullList({
            filter: `class = "${classId}"`,
            requestKey: null
        });

        if (enrollments.length === 0) return 0;

        // 2. Get fee details
        const fee = await pb.collection('fees').getOne<Fee>(feeId);

        // 3. Create invoices for each student
        const promises = enrollments.map(enrollment => {
            return pb.collection('invoices').create({
                student: enrollment.student,
                fee: feeId,
                amount: fee.amount,
                status: 'Pending'
            });
        });

        await Promise.all(promises);
        return enrollments.length;
    },

    /**
     * Get financial stats
     */
    async getStats() {
        const invoices = await this.getInvoices();

        const totalRevenue = invoices
            .filter(i => i.status === 'Paid')
            .reduce((sum, i) => sum + i.amount, 0);

        const outstanding = invoices
            .filter(i => i.status === 'Pending' || i.status === 'Overdue')
            .reduce((sum, i) => sum + i.amount, 0);

        // Simple "collected this month" logic (filtering by created date string match)
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const collectedThisMonth = invoices
            .filter(i => i.status === 'Paid' && i.updated.startsWith(currentMonth))
            .reduce((sum, i) => sum + i.amount, 0);

        return {
            totalRevenue,
            outstanding,
            collectedThisMonth
        };
    },

    /**
     * Get expenses (kept for compatibility)
     */
    async getExpenses() {
        return await pb.collection('expenses').getFullList<Expense>({
            sort: '-date',
            requestKey: null
        });
    }
};
