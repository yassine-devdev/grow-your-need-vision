import env from '../config/environment';
import pb from '../lib/pocketbase';

export interface FinanceSummary {
    totalRevenue: number;
    outstanding: number;
    totalExpenses: number;
    netIncome: number;
}

export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected';
export type PayrollStatus = 'Pending' | 'Paid';

export interface ExpenseRecord {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    status: ExpenseStatus;
}

export interface PayrollRecord {
    id: string;
    staff: string;
    amount: number;
    month: string;
    status: PayrollStatus;
    paid_at?: string;
    expand?: { staff?: { name?: string } };
}

export interface InvoiceRecord {
    id: string;
    student: string;
    fee: string;
    amount: number;
    status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled' | 'Partial';
    due_date: string;
    created: string;
    expand?: { student?: { name?: string }; fee?: { name?: string } };
}

export interface PaginatedResult<T> {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: T[];
}

class SchoolFinanceService {
    private apiUrl: string;
    private serviceApiKey: string;

    constructor() {
        this.apiUrl = env.get('apiUrl') || '/api';
        this.serviceApiKey = env.get('serviceApiKey');
    }

    private buildHeaders(): HeadersInit {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.serviceApiKey) {
            headers['x-api-key'] = this.serviceApiKey;
        }

        const tenantId = (pb.authStore.model as any)?.tenantId;
        if (tenantId) {
            headers['x-tenant-id'] = tenantId;
        }

        const role = (pb.authStore.model as any)?.role;
        if (role) {
            const elevated = ['Owner', 'SchoolAdmin', 'Admin'].includes(role);
            headers['x-user-role'] = elevated ? 'admin' : String(role);
        }
        const userId = (pb.authStore.model as any)?.id;
        if (userId) headers['x-user-id'] = String(userId);

        return headers;
    }

    async getSummary(): Promise<FinanceSummary> {
        const response = await fetch(`${this.apiUrl}/school/finance/summary`, {
            method: 'GET',
            headers: this.buildHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to load finance summary');
        }

        return response.json();
    }

    async createExpense(payload: { title: string; amount: number; category: string; date: string; status?: ExpenseStatus; }): Promise<any> {
        const response = await fetch(`${this.apiUrl}/school/finance/expenses`, {
            method: 'POST',
            headers: this.buildHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to create expense');
        }

        return response.json();
    }

    async updateExpenseStatus(id: string, status: ExpenseStatus): Promise<any> {
        const response = await fetch(`${this.apiUrl}/school/finance/expenses/${id}/status`, {
            method: 'PATCH',
            headers: this.buildHeaders(),
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update expense');
        }

        return response.json();
    }

    async listExpenses(search?: string): Promise<ExpenseRecord[]> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        const response = await fetch(`${this.apiUrl}/school/finance/expenses?${params.toString()}`, {
            method: 'GET',
            headers: this.buildHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to load expenses');
        }

        return response.json();
    }

    async runPayroll(month: string): Promise<{ created: number }> {
        const response = await fetch(`${this.apiUrl}/school/finance/payroll/run`, {
            method: 'POST',
            headers: this.buildHeaders(),
            body: JSON.stringify({ month }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to run payroll');
        }

        return response.json();
    }

    async updatePayrollStatus(id: string, status: PayrollStatus): Promise<any> {
        const response = await fetch(`${this.apiUrl}/school/finance/payroll/${id}/status`, {
            method: 'PATCH',
            headers: this.buildHeaders(),
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update payroll');
        }

        return response.json();
    }

    async listPayroll(search?: string): Promise<PayrollRecord[]> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        const response = await fetch(`${this.apiUrl}/school/finance/payroll?${params.toString()}`, {
            method: 'GET',
            headers: this.buildHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to load payroll');
        }

        return response.json();
    }

    async listInvoices(options: { page?: number; perPage?: number; search?: string; sort?: string; status?: string; dueFrom?: string; dueTo?: string; studentName?: string; feeName?: string } = {}): Promise<PaginatedResult<InvoiceRecord>> {
        const params = new URLSearchParams();
        if (options.page) params.append('page', String(options.page));
        if (options.perPage) params.append('perPage', String(options.perPage));
        if (options.search) params.append('search', options.search);
        if (options.sort) params.append('sort', options.sort);
        if (options.status) params.append('status', options.status);
        if (options.dueFrom) params.append('dueFrom', options.dueFrom);
        if (options.dueTo) params.append('dueTo', options.dueTo);
        if (options.studentName) params.append('studentName', options.studentName);
        if (options.feeName) params.append('feeName', options.feeName);
        const response = await fetch(`${this.apiUrl}/school/finance/invoices?${params.toString()}`, {
            method: 'GET',
            headers: this.buildHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to load invoices');
        }

        return response.json();
    }

    async exportInvoices(options: { search?: string; sort?: string; status?: string; dueFrom?: string; dueTo?: string; studentName?: string; feeName?: string } = {}): Promise<Blob> {
        const params = new URLSearchParams();
        if (options.search) params.append('search', options.search);
        if (options.sort) params.append('sort', options.sort);
        if (options.status) params.append('status', options.status);
        if (options.dueFrom) params.append('dueFrom', options.dueFrom);
        if (options.dueTo) params.append('dueTo', options.dueTo);
        if (options.studentName) params.append('studentName', options.studentName);
        if (options.feeName) params.append('feeName', options.feeName);

        const response = await fetch(`${this.apiUrl}/school/finance/invoices/export?${params.toString()}`, {
            method: 'GET',
            headers: this.buildHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to export invoices');
        }

        return response.blob();
    }

    async sendInvoiceReminders(invoiceIds: string[], options: { channels?: { email?: boolean; sms?: boolean; inApp?: boolean }; message?: string; throttleSeconds?: number } = {}) {
        const response = await fetch(`${this.apiUrl}/school/finance/invoices/reminders`, {
            method: 'POST',
            headers: this.buildHeaders(),
            body: JSON.stringify({ invoiceIds, ...options }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to send reminders');
        }
        return response.json();
    }

    async uploadPaymentProof(invoiceId: string, payload: { proofUrl: string; note?: string }) {
        const response = await fetch(`${this.apiUrl}/school/finance/invoices/${invoiceId}/proof`, {
            method: 'POST',
            headers: this.buildHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to upload proof');
        }
        return response.json();
    }

    async downloadReceiptPdf(invoiceId: string): Promise<Blob> {
        const response = await fetch(`${this.apiUrl}/school/finance/invoices/${invoiceId}/receipt.pdf`, {
            method: 'GET',
            headers: this.buildHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Receipt unavailable');
        }
        return response.blob();
    }

    async searchStudents(term: string) {
        const params = new URLSearchParams();
        if (term) params.append('term', term);
        const response = await fetch(`${this.apiUrl}/school/finance/students/search?${params.toString()}`, {
            method: 'GET',
            headers: this.buildHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to search students');
        }
        return response.json();
    }
}

export const schoolFinanceService = new SchoolFinanceService();
