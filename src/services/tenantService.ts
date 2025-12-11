import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface Tenant extends RecordModel {
    name: string;
    subdomain: string;
    custom_domain?: string;
    logo?: string;
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'suspended' | 'trial' | 'cancelled';
    subscription_status: 'active' | 'past_due' | 'cancelled' | 'trialing';
    admin_email: string;
    admin_user: string;
    max_students: number;
    max_teachers: number;
    max_storage_gb: number;
    features_enabled: string[];
    trial_ends_at?: string;
    subscription_ends_at?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    metadata?: Record<string, unknown>;
    branding?: {
        primaryColor: string;
        secondaryColor: string;
        fontFamily: string;
        logo?: string;
    };
    settings?: {
        allowRegistration: boolean;
        requireEmailVerification: boolean;
        defaultUserRole: string;
        features: string[];
    };
}

export interface TenantUsage extends RecordModel {
    tenant: string;
    period_start: string;
    period_end: string;
    student_count: number;
    teacher_count: number;
    storage_used_gb: number;
    api_calls: number;
    active_users: number;
}

export interface SubscriptionPlan extends RecordModel {
    name: string;
    stripe_price_id: string;
    price_monthly: number;
    price_annual: number;
    max_students: number;
    max_teachers: number;
    max_storage_gb: number;
    features: string[];
    is_active: boolean;
}

export const tenantService = {
    // Tenant CRUD
    getTenants: async (filter?: string) => {
        return await pb.collection('tenants').getList<Tenant>(1, 50, {
            filter: filter || '',
            sort: '-created',
            expand: 'admin_user'
        });
    },

    getTenantById: async (id: string) => {
        return await pb.collection('tenants').getOne<Tenant>(id, {
            expand: 'admin_user'
        });
    },

    createTenant: async (data: Omit<Tenant, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName'>) => {
        return await pb.collection('tenants').create<Tenant>(data);
    },

    updateTenant: async (id: string, data: Partial<Tenant>) => {
        return await pb.collection('tenants').update<Tenant>(id, data);
    },

    updateTenantStatus: async (id: string, status: Tenant['status']) => {
        return await pb.collection('tenants').update<Tenant>(id, { status });
    },

    deleteTenant: async (id: string) => {
        return await pb.collection('tenants').delete(id);
    },

    suspendTenant: async (id: string) => {
        return await pb.collection('tenants').update<Tenant>(id, { status: 'suspended' });
    },

    activateTenant: async (id: string) => {
        return await pb.collection('tenants').update<Tenant>(id, { status: 'active' });
    },

    addTenantUser: async (tenantId: string, userData: any) => {
        return await pb.collection('users').create({
            ...userData,
            tenant: tenantId
        });
    },

    getTenantUsers: async (tenantId: string) => {
        return await pb.collection('users').getList(1, 100, {
            filter: `tenant = "${tenantId}"`,
            sort: '-created'
        });
    },

    removeTenantUser: async (userId: string) => {
        return await pb.collection('users').delete(userId);
    },

    // Usage tracking
    getTenantUsage: async (tenantId: string, startDate?: string, endDate?: string) => {
        let filter = `tenant = "${tenantId}"`;
        if (startDate && endDate) {
            filter += ` && period_start >= "${startDate}" && period_end <= "${endDate}"`;
        }

        return await pb.collection('tenant_usage').getList<TenantUsage>(1, 100, {
            filter,
            sort: '-period_start'
        });
    },

    recordUsage: async (data: Omit<TenantUsage, 'id'>) => {
        return await pb.collection('tenant_usage').create(data);
    },

    // Current usage calculations
    getCurrentUsage: async (tenantId: string) => {
        // Get current counts
        const [students, teachers, classes] = await Promise.all([
            pb.collection('users').getList(1, 1, {
                filter: `tenant = "${tenantId}" && role = "Student"`,
                fields: 'id'
            }),
            pb.collection('users').getList(1, 1, {
                filter: `tenant = "${tenantId}" && role = "Teacher"`,
                fields: 'id'
            }),
            pb.collection('classes').getList(1, 1, {
                filter: `tenant = "${tenantId}"`,
                fields: 'id'
            })
        ]);

        return {
            student_count: students.totalItems,
            teacher_count: teachers.totalItems,
            class_count: classes.totalItems,
            storage_used_gb: 0 // Note: Requires backend aggregation or 'tenant_stats' collection for accurate calculation
        };
    },

    // Feature checks
    hasFeature: (tenant: Tenant, feature: string): boolean => {
        return tenant.features_enabled?.includes(feature) || false;
    },

    canAddStudent: async (tenantId: string): Promise<boolean> => {
        const tenant = await tenantService.getTenantById(tenantId);
        const usage = await tenantService.getCurrentUsage(tenantId);
        return usage.student_count < tenant.max_students;
    },

    canAddTeacher: async (tenantId: string): Promise<boolean> => {
        const tenant = await tenantService.getTenantById(tenantId);
        const usage = await tenantService.getCurrentUsage(tenantId);
        return usage.teacher_count < tenant.max_teachers;
    },

    // Subscription plans
    getPlans: async () => {
        return await pb.collection('subscription_plans').getFullList<SubscriptionPlan>({
            filter: 'is_active = true',
            sort: 'price_monthly'
        });
    },

    // Analytics
    getTenantStats: async () => {
        const tenants = await pb.collection('tenants').getList(1, 1, { fields: 'id' });
        const activeTenants = await pb.collection('tenants').getList(1, 1, {
            filter: 'status = "active"',
            fields: 'id'
        });
        const trialTenants = await pb.collection('tenants').getList(1, 1, {
            filter: 'status = "trial"',
            fields: 'id'
        });

        return {
            total: tenants.totalItems,
            active: activeTenants.totalItems,
            trial: trialTenants.totalItems,
            suspended: tenants.totalItems - activeTenants.totalItems - trialTenants.totalItems
        };
    },

    // MRR calculation
    calculateMRR: async (): Promise<number> => {
        const tenants = await pb.collection('tenants').getFullList<Tenant>({
            filter: 'subscription_status = "active"'
        });

        const monthlyPrices: Record<string, number> = {
            free: 0,
            basic: 99,
            pro: 299,
            enterprise: 999
        };

        return tenants.reduce((mrr, tenant) => {
            return mrr + (monthlyPrices[tenant.plan] || 0);
        }, 0);
    }
};
