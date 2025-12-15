import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface ActivityDetails {
    targetId?: string;
    targetName?: string;
    actionType?: string;
    metadata?: Record<string, string | number | boolean | null>;
    [key: string]: string | number | boolean | null | undefined | Record<string, unknown>;
}

export interface SchoolActivity {
    id: string;
    type: 'Info' | 'Warning' | 'Success' | 'Error';
    message: string;
    time: string; // Relative time string or ISO date
    timestamp: Date;
    details?: ActivityDetails;
}

export interface ChartDataPoint {
    label: string;
    value: number;
}

const tenantFilter = () => {
    const t = (pb.authStore.model as any)?.tenantId;
    return t ? `tenantId = "${t}"` : undefined;
};

export const schoolService = {
    async getRecentActivity(): Promise<SchoolActivity[]> {
        try {
            const filter = tenantFilter();
            const baseQuery = {
                sort: '-created',
                requestKey: null as any,
                filter
            };

            const recentUsers = await pb.collection('users').getList(1, 5, baseQuery);

            let recentClasses: RecordModel[] = [];
            try {
                const classesResult = await pb.collection('classes').getList(1, 5, baseQuery);
                recentClasses = classesResult.items;
            } catch (e) {
                console.log("Classes collection might be empty or missing");
            }

            const activities: SchoolActivity[] = [];

            recentUsers.items.forEach(user => {
                activities.push({
                    id: user.id,
                    type: 'Info',
                    message: `New ${user.role} Registered: ${user.name}`,
                    time: user.created,
                    timestamp: new Date(user.created),
                    details: { role: user.role }
                });
            });

            recentClasses.forEach(cls => {
                activities.push({
                    id: cls.id,
                    type: 'Success',
                    message: `New Class Scheduled: ${cls.name}`,
                    time: cls.created,
                    timestamp: new Date(cls.created)
                });
            });

            return activities
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 5);

        } catch (error) {
            console.error("Failed to fetch school activity:", error);
            return [];
        }
    },

    async getGrowthChartData(): Promise<ChartDataPoint[]> {
        try {
            const filterParts = [] as string[];
            const tf = tenantFilter();
            if (tf) filterParts.push(tf);

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
            sixMonthsAgo.setDate(1);
            const start = sixMonthsAgo.toISOString().slice(0, 10) + ' 00:00:00';
            filterParts.push(`created >= "${start}"`);

            const filter = filterParts.join(' && ');

            const usersPage = await pb.collection('users').getList(1, 500, {
                fields: 'created',
                filter,
                sort: 'created',
                requestKey: null
            });

            const allUsers = usersPage.items;
            const months = 6;
            const data: ChartDataPoint[] = [];
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            for (let i = months - 1; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthLabel = monthNames[d.getMonth()];
                const year = d.getFullYear();
                const monthEnd = new Date(year, d.getMonth() + 1, 0);

                const count = allUsers.filter(u => new Date(u.created) <= monthEnd).length;

                data.push({
                    label: monthLabel,
                    value: count
                });
            }

            return data;
        } catch (error) {
            console.error("Failed to fetch growth data:", error);
            return [];
        }
    }
};
