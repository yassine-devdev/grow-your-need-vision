import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface WellnessLog extends RecordModel {
    date: string;
    steps: number;
    calories: number;
    sleep_minutes: number;
    mood: string;
    user: string;
}

export const wellnessService = {
    async getLogs(userId: string, limit: number = 7): Promise<WellnessLog[]> {
        try {
            return await pb.collection('wellness_logs').getList<WellnessLog>(1, limit, {
                sort: '-date',
                filter: `user = "${userId}"`
            }).then(res => res.items);
        } catch (error) {
            console.warn('Failed to fetch wellness logs', error);
            return [];
        }
    },

    async getTodayLog(userId: string): Promise<WellnessLog | null> {
        try {
            const logs = await this.getLogs(userId, 1);
            if (logs.length > 0) {
                const logDate = new Date(logs[0].date).toDateString();
                const today = new Date().toDateString();
                if (logDate === today) {
                    return logs[0];
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    },

    async createLog(data: Partial<WellnessLog>): Promise<WellnessLog | null> {
        try {
            return await pb.collection('wellness_logs').create<WellnessLog>(data);
        } catch (error) {
            console.error('Failed to create wellness log', error);
            return null;
        }
    },

    async updateLog(id: string, data: Partial<WellnessLog>): Promise<WellnessLog | null> {
        try {
            return await pb.collection('wellness_logs').update<WellnessLog>(id, data);
        } catch (error) {
            console.error('Failed to update wellness log', error);
            return null;
        }
    }
};
