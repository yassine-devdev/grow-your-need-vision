import pb from '../lib/pocketbase';
import { auditLog } from './auditLogger';

export interface Webhook {
    id: string;
    name: string;
    url: string;
    events: string[];
    status: 'active' | 'paused' | 'failed';
    secret_key: string;
    last_triggered?: string;
    success_rate: number;
    created: string;
    updated: string;
}

class WebhookService {
    private collection = 'webhooks';

    async getAll(): Promise<Webhook[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                sort: '-created',
            });
            return records as unknown as Webhook[];
        } catch (error) {
            console.error('Failed to fetch webhooks:', error);
            throw new Error('Failed to load webhooks');
        }
    }

    async getById(id: string): Promise<Webhook> {
        try {
            const record = await pb.collection(this.collection).getOne(id);
            return record as unknown as Webhook;
        } catch (error) {
            console.error(`Failed to fetch webhook ${id}:`, error);
            throw new Error('Failed to load webhook');
        }
    }

    async create(data: Omit<Webhook, 'id' | 'created' | 'updated' | 'success_rate'>): Promise<Webhook> {
        try {
            const record = await pb.collection(this.collection).create({
                ...data,
                success_rate: 100
            });
            await auditLog.log('webhook.create', { webhook_id: record.id, name: data.name, url: data.url }, 'info');
            return record as unknown as Webhook;
        } catch (error) {
            console.error('Failed to create webhook:', error);
            throw new Error('Failed to create webhook');
        }
    }

    async update(id: string, data: Partial<Webhook>): Promise<Webhook> {
        try {
            const record = await pb.collection(this.collection).update(id, data);
            await auditLog.log('webhook.update', { webhook_id: id, changes: data }, 'info');
            return record as unknown as Webhook;
        } catch (error) {
            console.error(`Failed to update webhook ${id}:`, error);
            throw new Error('Failed to update webhook');
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await pb.collection(this.collection).delete(id);
            await auditLog.log('webhook.delete', { webhook_id: id }, 'warning');
            return true;
        } catch (error) {
            console.error(`Failed to delete webhook ${id}:`, error);
            throw new Error('Failed to delete webhook');
        }
    }

    async test(id: string): Promise<boolean> {
        try {
            const webhook = await this.getById(id);
            // TODO: Implement actual webhook test call
            console.log('Testing webhook:', webhook.url);
            await auditLog.log('webhook.test', { webhook_id: id, url: webhook.url }, 'info');
            return true;
        } catch (error) {
            console.error(`Failed to test webhook ${id}:`, error);
            throw new Error('Failed to test webhook');
        }
    }

    async updateStatus(id: string, status: Webhook['status']): Promise<Webhook> {
        return this.update(id, { status });
    }

    async recordTrigger(id: string, success: boolean): Promise<void> {
        try {
            const webhook = await this.getById(id);
            const newSuccessRate = success
                ? Math.min(100, webhook.success_rate + 0.1)
                : Math.max(0, webhook.success_rate - 1);

            await pb.collection(this.collection).update(id, {
                last_triggered: new Date().toISOString(),
                success_rate: newSuccessRate,
                status: newSuccessRate < 50 ? 'failed' : 'active'
            });
        } catch (error) {
            console.error(`Failed to record trigger for webhook ${id}:`, error);
        }
    }
}

export const webhookService = new WebhookService();
