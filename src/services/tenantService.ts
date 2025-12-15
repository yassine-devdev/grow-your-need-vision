import pb from '../lib/pocketbase';
import { RecordModel, ListResult } from 'pocketbase';
import { isMockEnv } from '../utils/mockData';

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

const fallbackSeed: Tenant[] = [
    {
        id: 'tenant-seed-1', collectionId: 'mock', collectionName: 'tenants', created: new Date().toISOString(), updated: new Date().toISOString(),
        name: 'Northstar Academy', subdomain: 'northstar', plan: 'pro', status: 'active', subscription_status: 'active', admin_email: 'owner@growyourneed.com', admin_user: 'mock-owner', max_students: 500, max_teachers: 50, max_storage_gb: 200, features_enabled: ['analytics', 'reports'],
        trial_ends_at: undefined, subscription_ends_at: undefined, branding: { primaryColor: '#1d4ed8', secondaryColor: '#f97316', fontFamily: 'Inter' }, settings: { allowRegistration: true, requireEmailVerification: false, defaultUserRole: 'Student', features: [] },
        metadata: {},
    },
    {
        id: 'tenant-seed-2', collectionId: 'mock', collectionName: 'tenants', created: new Date().toISOString(), updated: new Date().toISOString(),
        name: 'Summit Prep', subdomain: 'summit', plan: 'basic', status: 'trial', subscription_status: 'trialing', admin_email: 'admin@school.com', admin_user: 'mock-admin', max_students: 200, max_teachers: 20, max_storage_gb: 50, features_enabled: ['crm'],
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), subscription_ends_at: undefined,
        metadata: {},
    }
];

let mockTenants: Tenant[] = [];

const seedMockTenants = () => {
    if (mockTenants.length === 0) {
        mockTenants = fallbackSeed.map(t => ({ ...t }));
    }
    return mockTenants;
};

const ensureMockTenants = () => seedMockTenants();

export const tenantService = {
    // Tenant CRUD
    getTenants: async (filter?: string) => {
        const buildResult = (items: Tenant[]): ListResult<Tenant> => ({
            page: 1,
            perPage: 50,
            totalItems: items.length,
            totalPages: 1,
            items,
        });

        const runner = () => pb.collection('tenants').getList<Tenant>(1, 50, {
            filter: filter || '',
            sort: '-created',
            expand: 'admin_user'
        });

        if (isMockEnv()) {
            try {
                const result = await Promise.race([
                    runner(),
                    new Promise<ListResult<Tenant>>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1200))
                ]);
                return result;
            } catch (err) {
                console.warn('Tenant service mock fallback due to fetch error');
                const seeded = ensureMockTenants();
                return buildResult(seeded);
            }
        }

        try {
            const result = await runner();
            return result;
        } catch (err) {
            console.warn('Tenant service failed, returning fallback seed list');
            const seeded = ensureMockTenants();
            return buildResult(seeded);
        }
    },

    getTenantById: async (id: string) => {
        if (isMockEnv()) {
            ensureMockTenants();
            return mockTenants.find(t => t.id === id) as Tenant;
        }
        return await pb.collection('tenants').getOne<Tenant>(id, {
            expand: 'admin_user'
        });
    },

    createTenant: async (data: Omit<Tenant, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName'>) => {
        if (isMockEnv()) {
            ensureMockTenants();
            const tenant = {
                ...data,
                id: `mock-tenant-${Date.now()}`,
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                collectionId: 'mock',
                collectionName: 'tenants',
            } as Tenant;
            mockTenants.unshift(tenant);
            return tenant;
        }
        return await pb.collection('tenants').create<Tenant>(data);
    },

    updateTenant: async (id: string, data: Partial<Tenant>) => {
        if (isMockEnv()) {
            const idx = mockTenants.findIndex(t => t.id === id);
            if (idx >= 0) {
                mockTenants[idx] = { ...mockTenants[idx], ...data, updated: new Date().toISOString() } as Tenant;
                return mockTenants[idx];
            }
            return null as any;
        }
        return await pb.collection('tenants').update<Tenant>(id, data);
    },

    updateTenantStatus: async (id: string, status: Tenant['status']) => {
        if (isMockEnv()) {
            const tenant = mockTenants.find(t => t.id === id);
            if (tenant) {
                tenant.status = status;
                tenant.updated = new Date().toISOString();
                return tenant;
            }
            return null as any;
        }
        return await pb.collection('tenants').update<Tenant>(id, { status });
    },

    deleteTenant: async (id: string) => {
        if (isMockEnv()) {
            const idx = mockTenants.findIndex(t => t.id === id);
            if (idx >= 0) mockTenants.splice(idx, 1);
            return true;
        }
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
        if (isMockEnv()) {
            return { items: [], totalItems: 0 } as any;
        }
        return await pb.collection('users').getList(1, 100, {
            filter: `tenant = "${tenantId}"`,
            sort: '-created'
        });
    },

    seedMockTenants,

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
