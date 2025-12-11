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

export const schoolService = {
    async getRecentActivity(): Promise<SchoolActivity[]> {
        try {
            // 1. Fetch recent users (New Admissions/Staff)
            const recentUsers = await pb.collection('users').getList(1, 5, {
                sort: '-created',
                requestKey: null
            });

            // 2. Fetch recent classes (if any)
            let recentClasses: RecordModel[] = [];
            try {
                const classesResult = await pb.collection('classes').getList(1, 5, {
                    sort: '-created',
                    requestKey: null
                });
                recentClasses = classesResult.items;
            } catch (e) {
                console.log("Classes collection might be empty or missing");
            }

            // Combine and format
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

            // Sort by date desc
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
            // Fetch all users to calculate growth over time
            // In a real production app with millions of users, this should be an aggregated query on the backend
            const allUsers = await pb.collection('users').getFullList({
                fields: 'created',
                requestKey: null
            });

            const months = 6;
            const data: ChartDataPoint[] = [];
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            for (let i = months - 1; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthLabel = monthNames[d.getMonth()];
                const year = d.getFullYear();
                
                // End of that month
                const monthEnd = new Date(year, d.getMonth() + 1, 0);

                // Count users created on or before this month
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
