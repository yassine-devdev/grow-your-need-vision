import pb from '@/lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface AIConfig extends RecordModel {
    key: string;
    value: any;
    description: string;
}

export interface AIObjective extends RecordModel {
    title: string;
    target: string;
    current_value: number;
    target_value: number;
    unit: string;
    status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
    deadline: string;
}

export interface UsageLog extends RecordModel {
    user_id: string;
    model: string;
    tokens_input: number;
    tokens_output: number;
    cost: number;
    request_type: string;
}

export const aiManagementService = {
    // AI Config
    async getConfigs(): Promise<AIConfig[]> {
        return await pb.collection('ai_config').getFullList<AIConfig>();
    },

    async updateConfig(id: string, data: Partial<AIConfig>): Promise<AIConfig> {
        return await pb.collection('ai_config').update<AIConfig>(id, data);
    },

    async getConfigByKey(key: string): Promise<AIConfig | null> {
        try {
            return await pb.collection('ai_config').getFirstListItem<AIConfig>(`key="${key}"`);
        } catch (e) {
            return null;
        }
    },

    // AI Objectives
    async getObjectives(): Promise<AIObjective[]> {
        return await pb.collection('ai_objectives').getFullList<AIObjective>({ sort: '-created' });
    },

    async createObjective(data: Partial<AIObjective>): Promise<AIObjective> {
        return await pb.collection('ai_objectives').create<AIObjective>(data);
    },

    async updateObjective(id: string, data: Partial<AIObjective>): Promise<AIObjective> {
        return await pb.collection('ai_objectives').update<AIObjective>(id, data);
    },

    async deleteObjective(id: string): Promise<boolean> {
        return await pb.collection('ai_objectives').delete(id);
    },

    // Usage Logs / Analytics
    async getUsageStats(period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
        // This would ideally be an aggregation query, but PB doesn't support them natively yet.
        // We'll fetch logs and aggregate client-side for now, or use a custom endpoint if we had one.
        // For now, let's just fetch the last N logs.
        const logs = await pb.collection('usage_logs').getList<UsageLog>(1, 1000, { sort: '-created' });
        
        // Simple aggregation
        let totalTokens = 0;
        let totalCost = 0;
        
        logs.items.forEach(log => {
            totalTokens += (log.tokens_input || 0) + (log.tokens_output || 0);
            totalCost += (log.cost || 0);
        });

        return {
            totalTokens,
            totalCost,
            logs: logs.items
        };
    },

    // Operations / Health
    async getSystemHealth(): Promise<any> {
        // Check PB connection
        const pbStatus = pb.authStore.isValid ? 'Connected' : 'Disconnected'; // Not really a health check, but a start.
        
        // We could try to fetch something to verify connection
        let dbConnected = false;
        try {
            await pb.collection('users').getList(1, 1);
            dbConnected = true;
        } catch (e) {
            dbConnected = false;
        }

        // Check Python Service (if we had a URL)
        // For now, mock the Python service check or assume it's running if we can hit it.
        // We'll implement a real check in the component using fetch.

        return {
            database: dbConnected ? 'Operational' : 'Down',
            // other services...
        };
    }
};
