import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';
import { Invoice } from './billingService';

export interface TenantBranding {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    customCss?: string;
}

export interface TenantSettings {
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: string;
    features: string[];
}

export interface Tenant extends RecordModel {
    name: string;
    type: 'School' | 'Individual' | 'Enterprise';
    status: 'Active' | 'Pending' | 'Suspended' | 'Trial';
    domain: string;
    contact_email: string;
    subscription_plan: 'Starter' | 'Professional' | 'Enterprise';
    users_count: number;
    branding?: TenantBranding;
    settings?: TenantSettings;
    address?: string;
    phone?: string;
    website?: string;
    billing_cycle?: 'Monthly' | 'Yearly';
    next_billing_date?: string;
}

export interface TenantUser extends RecordModel {
    username: string;
    email: string;
    name: string;
    role: 'Admin' | 'Teacher' | 'Student' | 'Parent';
    tenantId: string;
    avatar?: string;
    status: 'Active' | 'Inactive';
}

export const tenantService = {
    // --- Tenant CRUD ---
    async getTenants(filter?: string): Promise<Tenant[]> {
        console.log("Fetching tenants...");
        try {
            // Fetch ALL tenants to avoid 400 errors with filters
            const allTenants = await pb.collection('tenants').getFullList<Tenant>();
            console.log(`Fetched ${allTenants.length} tenants.`);

            if (filter) {
                if (filter.includes('type = "School"')) return allTenants.filter(t => t.type === 'School');
                if (filter.includes('type = "Individual"')) return allTenants.filter(t => t.type === 'Individual');
            }
            return allTenants;
        } catch (err) {
            console.error("Error in getTenants:", err);
            throw err;
        }
    },

    async getSchools(): Promise<Tenant[]> {
        return this.getTenants('type = "School"');
    },

    async getIndividuals(): Promise<Tenant[]> {
        return this.getTenants('type = "Individual"');
    },

    async getTenant(id: string): Promise<Tenant | null> {
        try {
            return await pb.collection('tenants').getOne<Tenant>(id);
        } catch (error) {
            console.error('Error fetching tenant:', error);
            return null;
        }
    },

    async createTenant(data: Partial<Tenant>): Promise<Tenant | null> {
        try {
            return await pb.collection('tenants').create<Tenant>(data);
        } catch (error) {
            console.error('Error creating tenant:', error);
            return null;
        }
    },

    async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant | null> {
        try {
            return await pb.collection('tenants').update<Tenant>(id, data);
        } catch (error) {
            console.error('Error updating tenant:', error);
            return null;
        }
    },

    async updateTenantStatus(id: string, status: Tenant['status']): Promise<Tenant | null> {
        return this.updateTenant(id, { status });
    },

    async deleteTenant(id: string): Promise<boolean> {
        try {
            return await pb.collection('tenants').delete(id);
        } catch (error) {
            console.error('Error deleting tenant:', error);
            return false;
        }
    },

    // --- Tenant Users ---
    async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
        try {
            // Fetch ALL users to avoid 400 errors with filters
            const allUsers = await pb.collection('users').getFullList<TenantUser>({ requestKey: null });
            return allUsers.filter(u => u.tenantId === tenantId);
        } catch (error) {
            console.error('Error fetching tenant users:', error);
            return [];
        }
    },

    async addTenantUser(tenantId: string, data: Partial<TenantUser>): Promise<TenantUser | null> {
        try {
            // Ensure tenantId is set
            return await pb.collection('users').create<TenantUser>({ ...data, tenantId });
        } catch (error) {
            console.error('Error adding tenant user:', error);
            return null;
        }
    },

    async removeTenantUser(userId: string): Promise<boolean> {
        try {
            // We might want to soft delete or just remove tenantId
            return await pb.collection('users').delete(userId);
        } catch (error) {
            console.error('Error removing tenant user:', error);
            return false;
        }
    },

    // --- White Labeling ---
    async updateBranding(tenantId: string, branding: TenantBranding): Promise<Tenant | null> {
        try {
            return await pb.collection('tenants').update<Tenant>(tenantId, { branding });
        } catch (error) {
            console.error('Error updating branding:', error);
            return null;
        }
    },

    // --- Billing ---
    async getInvoices(tenantId: string): Promise<Invoice[]> {
        try {
            // Fetch ALL invoices to avoid 400 errors with filters
            const allInvoices = await pb.collection('invoices').getFullList<Invoice>({ requestKey: null });
            return allInvoices.filter(i => i.tenantId === tenantId);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            return [];
        }
    }
};
