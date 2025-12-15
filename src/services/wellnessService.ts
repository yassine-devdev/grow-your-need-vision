import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';
import { isMockEnv } from '../utils/mockData';

export interface Meal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    time: string;
}

export interface WellnessLog extends RecordModel {
    date: string;
    steps: number;
    calories: number;
    sleep_minutes: number;
    mood: string;
    user: string;
    meals: Meal[];
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
            if (isMockEnv()) {
                const today = new Date();
                const baseLog: WellnessLog = {
                    id: 'wellness-mock-1',
                    collectionId: 'mock',
                    collectionName: 'wellness_logs',
                    created: today.toISOString(),
                    updated: today.toISOString(),
                    date: today.toISOString(),
                    steps: 8500,
                    calories: 520,
                    sleep_minutes: 430,
                    mood: 'Energized',
                    user: userId,
                    meals: []
                } as WellnessLog;

                return [baseLog];
            }
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
