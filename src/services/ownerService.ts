import pb from '../lib/pocketbase';
import { RecordModel, ListResult } from 'pocketbase';
import { tenantService, Tenant } from './tenantService';
import { billingService, Invoice } from './billingService';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface DashboardKPI {
    label: string;
    value: string | number;
    change: number; // percentage
    changeLabel: string;
    trend: 'up' | 'down' | 'neutral';
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export interface SystemAlert extends RecordModel {
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
    actionUrl?: string;
}

export interface ChartDataPoint {
    label: string;
    value: number;
    value2?: number; // For comparison
    type?: 'actual' | 'projected';
}

export interface CohortData {
    cohort: string;
    retention: number[];
}

export interface AuditLog extends RecordModel {
    action: string;
    user: string;
    details: JsonValue;
    ip_address: string;
    module: string;
}

export interface SystemSetting extends RecordModel {
    key: string;
    value: JsonValue;
    description: string;
    category: string;
}

export interface SubscriptionPlan extends RecordModel {
    name: string;
    price_monthly: number;
    price_yearly: number;
    features: string[];
    limits: JsonValue;
    is_active: boolean;
}

export interface OwnerDashboardData {
    kpis: {
        mrr: DashboardKPI;
        activeTenants: DashboardKPI;
        ltv: DashboardKPI;
        churn: DashboardKPI;
    };
    alerts: SystemAlert[];
    revenueHistory: ChartDataPoint[];
    tenantGrowth: ChartDataPoint[];
    recentActivity: AuditLog[];
    // New Data
    topVisitedPages: { label: string; value: number; color: string; subLabel?: string }[];
    topUserAccess: { label: string; value: number; color: string }[];
    expensesByCategory: { label: string; value: number; color: string; percentage: number }[];
    // Advanced Analytics
    predictiveRevenue: ChartDataPoint[];
    cohortRetention: CohortData[];
}

class OwnerService {
    async getDashboardData(): Promise<OwnerDashboardData> {
        // Initialize default values
        let activeTenantsCount = 0;
        let suspendedTenantsCount = 0;
        let newTenantsCount = 0;
        let mrrValue = 0;
        let alerts: SystemAlert[] = [];
        let revenueHistory: ChartDataPoint[] = [];
        let tenantGrowth: ChartDataPoint[] = [];
        let combinedActivity: AuditLog[] = [];
        let topVisitedPages: { label: string; value: number; color: string; subLabel?: string }[] = [];
        let topUserAccess: { label: string; value: number; color: string }[] = [];
        let expensesByCategory: { label: string; value: number; color: string; percentage: number }[] = [];
        let predictiveRevenue: ChartDataPoint[] = [];
        let cohortRetention: CohortData[] = [];

        try {
            // --- New Analytics Fetching ---
            try {
                const pages = await this.getTopVisitedPages();
                topVisitedPages = pages.map(p => ({
                    label: p.path,
                    value: p.visitors,
                    color: p.category === 'Social' ? '#3b82f6' : p.category === 'Internal' ? '#06b6d4' : '#8b5cf6',
                    subLabel: p.category
                }));

                const sources = await this.getTopUserAccess();
                topUserAccess = sources.map(s => ({
                    label: s.source,
                    value: s.visitors,
                    color: s.color || '#cbd5e1'
                }));

                const expenses = await this.getExpensesByCategory();
                expensesByCategory = expenses.map(e => ({
                    label: e.category,
                    value: e.amount,
                    color: e.color || '#cbd5e1',
                    percentage: e.percentage || 0
                }));
            } catch (e) {
                console.error("Error fetching analytics data:", e);
            }

            // 1. Tenant Metrics
            try {
                const activeTenantsResult = await pb.collection('tenants').getList(1, 1, {
                    filter: 'status = "Active"',
                    requestKey: null
                });
                activeTenantsCount = activeTenantsResult.totalItems;

                const suspendedTenantsResult = await pb.collection('tenants').getList(1, 1, {
                    filter: 'status = "Suspended"',
                    requestKey: null
                });
                suspendedTenantsCount = suspendedTenantsResult.totalItems;

                // New Tenants this month
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().replace('T', ' ');
                
                // OPTIMIZED: Fetch count directly using filter
                const newTenantsList = await pb.collection('tenants').getList(1, 1, {
                    filter: `created >= "${firstDayOfMonth}"`,
                    requestKey: null,
                    count: true
                });
                newTenantsCount = newTenantsList.totalItems;
            } catch (e) {
                console.error("Error fetching tenant metrics:", e);
            }

            // 2. Revenue Metrics
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().replace('T', ' ');

                const recentInvoices = await pb.collection('invoices').getFullList<Invoice>({
                    filter: `status = "Paid" && paid_at >= "${thirtyDaysAgoStr}"`,
                    requestKey: null
                });
                mrrValue = recentInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
            } catch (e) {
                console.error("Error fetching revenue metrics:", e);
            }

            // 3. Alerts
            try {
                // OPTIMIZED: Fetch latest 5 alerts sorted by created
                const recentAlerts = await pb.collection('system_alerts').getList<SystemAlert>(1, 5, {
                    sort: '-created',
                    requestKey: null
                });
                
                alerts = recentAlerts.items.map(a => ({
                    ...a,
                    timestamp: a.created
                }));
            } catch (e) {
                console.error("Error fetching alerts:", e);
            }

            // 4. Revenue History (Last 6 Months)
            try {
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
                sixMonthsAgo.setDate(1);
                const sixMonthsAgoStr = sixMonthsAgo.toISOString().replace('T', ' ');

                const historyInvoices = await pb.collection('invoices').getFullList<Invoice>({
                    filter: `status = "Paid" && paid_at >= "${sixMonthsAgoStr}"`,
                    requestKey: null
                });

                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                for (let i = 5; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const monthLabel = monthNames[d.getMonth()];
                    const year = d.getFullYear();

                    const monthStart = new Date(year, d.getMonth(), 1);
                    const monthEnd = new Date(year, d.getMonth() + 1, 0);

                    const monthlyRevenue = historyInvoices
                        .filter(inv => {
                            const invDate = new Date(inv.paid_at || inv.created);
                            return invDate >= monthStart && invDate <= monthEnd;
                        })
                        .reduce((sum, inv) => sum + (inv.amount || 0), 0);

                    revenueHistory.push({
                        label: monthLabel,
                        value: monthlyRevenue
                    });
                }
            } catch (e) {
                console.error("Error fetching revenue history:", e);
            }

            // 5. Tenant Growth (Last 6 Months)
            try {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                const growthPromises = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const monthLabel = monthNames[d.getMonth()];
                    const year = d.getFullYear();
                    const monthEnd = new Date(year, d.getMonth() + 1, 0).toISOString().replace('T', ' ');

                    growthPromises.push(
                        pb.collection('tenants').getList(1, 1, {
                            filter: `created <= "${monthEnd}"`,
                            requestKey: null,
                            count: true
                        }).then(res => ({
                            label: monthLabel,
                            value: res.totalItems
                        }))
                    );
                }
                
                tenantGrowth = await Promise.all(growthPromises);
            } catch (e) {
                console.error("Error fetching tenant growth:", e);
            }

            // 5.5 Predictive Revenue & Cohorts (Advanced Analytics)
            try {
                // Predictive Revenue
                if (revenueHistory.length > 0) {
                    // Copy existing history as 'actual'
                    predictiveRevenue = revenueHistory.map(h => ({ ...h, type: 'actual' }));
                    
                    // Simple projection: Average of last 3 months
                    const last3Months = revenueHistory.slice(-3);
                    const avgRevenue = last3Months.length > 0 ? last3Months.reduce((sum, item) => sum + item.value, 0) / last3Months.length : 0;
                    const growthRate = 1.05; // Assume 5% growth for projection

                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const lastDate = new Date(); // Current month is the last one in history

                    for (let i = 1; i <= 3; i++) {
                        const nextMonth = new Date(lastDate);
                        nextMonth.setMonth(lastDate.getMonth() + i);
                        const label = monthNames[nextMonth.getMonth()];
                        
                        const projectedValue = avgRevenue * Math.pow(growthRate, i);
                        predictiveRevenue.push({
                            label: label,
                            value: Math.round(projectedValue),
                            type: 'projected'
                        });
                    }
                }

                // Cohort Retention (Mocked for now)
                cohortRetention = [
                    { cohort: 'Aug 2024', retention: [100, 95, 90, 88, 85] },
                    { cohort: 'Sep 2024', retention: [100, 92, 88, 85] },
                    { cohort: 'Oct 2024', retention: [100, 94, 91] },
                    { cohort: 'Nov 2024', retention: [100, 96] },
                    { cohort: 'Dec 2024', retention: [100] }
                ];

            } catch (e) {
                console.error("Error calculating advanced analytics:", e);
            }

            // 6. Activity Feed
            try {
                // WORKAROUND: Fetch all records and sort in memory because 'created' sort is failing
                const allTenants = await pb.collection('tenants').getFullList({ requestKey: null });
                const allInvoices = await pb.collection('invoices').getFullList({ requestKey: null });

                const recentTenantsLogs = allTenants.map(t => ({
                    id: t.id,
                    collectionId: t.collectionId,
                    collectionName: t.collectionName,
                    created: t.created,
                    updated: t.updated,
                    action: 'New Tenant',
                    user: 'System',
                    details: { name: t.name },
                    ip_address: '-',
                    module: 'Tenants'
                }));

                const recentInvoicesLogs = allInvoices.map(i => ({
                    id: i.id,
                    collectionId: i.collectionId,
                    collectionName: i.collectionName,
                    created: i.created,
                    updated: i.updated,
                    action: 'Payment Received',
                    user: 'System',
                    details: { amount: i.amount, status: i.status },
                    ip_address: '-',
                    module: 'Billing'
                }));

                combinedActivity = [...recentTenantsLogs, ...recentInvoicesLogs]
                    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                    .slice(0, 10) as AuditLog[];
            } catch (e) {
                console.error("Error fetching activity feed:", e);
            }

            // Calculations
            const totalTenantsCount = activeTenantsCount + suspendedTenantsCount;
            const arpu = activeTenantsCount > 0 ? mrrValue / activeTenantsCount : 0;
            const churnRate = totalTenantsCount > 0 ? (suspendedTenantsCount / totalTenantsCount) * 100 : 0;
            const ltvValue = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 24;

            // Revenue Change
            let revenueChange = 0;
            if (revenueHistory.length >= 2) {
                const lastMonth = revenueHistory[revenueHistory.length - 1].value;
                const prevMonth = revenueHistory[revenueHistory.length - 2].value;
                if (prevMonth > 0) {
                    revenueChange = ((lastMonth - prevMonth) / prevMonth) * 100;
                }
            }

            return {
                kpis: {
                    mrr: {
                        label: 'Monthly Recurring Revenue',
                        value: `$${mrrValue.toLocaleString()}`,
                        change: Math.round(revenueChange),
                        changeLabel: 'from last month',
                        trend: revenueChange >= 0 ? 'up' : 'down',
                        color: revenueChange >= 0 ? 'green' : 'red'
                    },
                    activeTenants: {
                        label: 'Active Tenants',
                        value: activeTenantsCount.toString(),
                        change: newTenantsCount,
                        changeLabel: 'new this month',
                        trend: 'up',
                        color: 'blue'
                    },
                    ltv: {
                        label: 'Customer LTV',
                        value: `$${Math.round(ltvValue).toLocaleString()}`,
                        change: 0,
                        changeLabel: 'avg. increase',
                        trend: 'neutral',
                        color: 'purple'
                    },
                    churn: {
                        label: 'Churn Rate',
                        value: `${churnRate.toFixed(1)}%`,
                        change: 0,
                        changeLabel: 'from last month',
                        trend: 'neutral',
                        color: 'orange'
                    }
                },
                alerts: alerts,
                revenueHistory: revenueHistory,
                tenantGrowth: tenantGrowth,
                recentActivity: combinedActivity,
                topVisitedPages: topVisitedPages,
                topUserAccess: topUserAccess,
                expensesByCategory: expensesByCategory,
                predictiveRevenue: predictiveRevenue,
                cohortRetention: cohortRetention
            };

        } catch (err) {
            console.error("OwnerService: Critical error fetching data:", err);
            throw err;
        }
    }

    async getSystemHealth() {
        return await pb.collection('system_health').getFirstListItem('');
    }

    // --- New Methods ---

    async getAuditLogs(page = 1, perPage = 50): Promise<ListResult<AuditLog>> {
        return await pb.collection('audit_logs').getList<AuditLog>(page, perPage, {
            sort: '-created',
            expand: 'user'
        });
    }

    async getSystemSettings(): Promise<SystemSetting[]> {
        return await pb.collection('system_settings').getFullList<SystemSetting>();
    }

    async updateSystemSetting(id: string, value: JsonValue): Promise<SystemSetting> {
        return await pb.collection('system_settings').update<SystemSetting>(id, { value });
    }

    async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
        return await pb.collection('subscription_plans').getFullList<SubscriptionPlan>({
            sort: 'price_monthly'
        });
    }

    async createSubscriptionPlan(data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
        return await pb.collection('subscription_plans').create<SubscriptionPlan>(data);
    }

    async updateSubscriptionPlan(id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
        return await pb.collection('subscription_plans').update<SubscriptionPlan>(id, data);
    }

    // --- Analytics & Finance ---

    async getTopVisitedPages(): Promise<RecordModel[]> {
        const res = await pb.collection('analytics_pages').getList(1, 10, { sort: '-visitors' });
        return res.items;
    }

    async getTopUserAccess(): Promise<RecordModel[]> {
        const res = await pb.collection('analytics_sources').getList(1, 10, { sort: '-visitors' });
        return res.items;
    }

    async getExpensesByCategory(): Promise<RecordModel[]> {
        const res = await pb.collection('finance_expenses').getList(1, 10, { sort: '-amount' });
        return res.items;
    }
}

export const ownerService = new OwnerService();
