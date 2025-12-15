import pb from '../lib/pocketbase';
import { auditLog } from './auditLogger';

export interface BroadcastMessage {
    id: string;
    subject: string;
    message: string;
    target_audience: 'all' | 'schools' | 'individuals' | 'active' | 'trial';
    priority: 'normal' | 'high' | 'urgent';
    channels: {
        email: boolean;
        inApp: boolean;
        sms: boolean;
    };
    sent_at?: string;
    sent_by: string;
    recipient_count?: number;
    created: string;
    updated: string;
}

class BroadcastService {
    private collection = 'broadcast_messages';

    async getAll(): Promise<BroadcastMessage[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                sort: '-created',
            });
            return records as unknown as BroadcastMessage[];
        } catch (error) {
            console.error('Failed to fetch broadcast messages:', error);
            throw new Error('Failed to load broadcast messages');
        }
    }

    async getById(id: string): Promise<BroadcastMessage> {
        try {
            const record = await pb.collection(this.collection).getOne(id);
            return record as unknown as BroadcastMessage;
        } catch (error) {
            console.error(`Failed to fetch broadcast ${id}:`, error);
            throw new Error('Failed to load broadcast message');
        }
    }

    async send(data: Omit<BroadcastMessage, 'id' | 'created' | 'updated' | 'sent_at' | 'recipient_count'>): Promise<BroadcastMessage> {
        try {
            // Calculate recipient count based on target audience
            const recipientCount = await this.estimateRecipientCount(data.target_audience);

            const record = await pb.collection(this.collection).create({
                ...data,
                sent_at: new Date().toISOString(),
                recipient_count: recipientCount
            });

            await auditLog.log('broadcast.send', {
                broadcast_id: record.id,
                subject: data.subject,
                target: data.target_audience,
                channels: data.channels,
                priority: data.priority,
                recipient_count: recipientCount
            }, 'critical');

            // TODO: Implement actual sending logic for each channel
            if (data.channels.email) {
                console.log('Sending email broadcast to', recipientCount, 'recipients');
            }
            if (data.channels.inApp) {
                console.log('Creating in-app notifications for', recipientCount, 'users');
            }
            if (data.channels.sms) {
                console.log('Sending SMS to', recipientCount, 'recipients');
            }

            return record as unknown as BroadcastMessage;
        } catch (error) {
            console.error('Failed to send broadcast:', error);
            throw new Error('Failed to send broadcast message');
        }
    }

    async estimateRecipientCount(target: BroadcastMessage['target_audience']): Promise<number> {
        try {
            // TODO: Implement actual count from tenants collection
            const tenants = await pb.collection('tenants').getList(1, 1);
            const totalTenants = tenants.totalItems;

            switch (target) {
                case 'all': return totalTenants;
                case 'schools': return Math.floor(totalTenants * 0.7);
                case 'individuals': return Math.floor(totalTenants * 0.3);
                case 'active': return Math.floor(totalTenants * 0.8);
                case 'trial': return Math.floor(totalTenants * 0.2);
                default: return totalTenants;
            }
        } catch (error) {
            console.error('Failed to estimate recipient count:', error);
            return 0;
        }
    }

    async getSentMessages(): Promise<BroadcastMessage[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                filter: 'sent_at != ""',
                sort: '-sent_at',
            });
            return records as unknown as BroadcastMessage[];
        } catch (error) {
            console.error('Failed to fetch sent messages:', error);
            throw new Error('Failed to load sent messages');
        }
    }

    async getByPriority(priority: BroadcastMessage['priority']): Promise<BroadcastMessage[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                filter: `priority = "${priority}"`,
                sort: '-created',
            });
            return records as unknown as BroadcastMessage[];
        } catch (error) {
            console.error(`Failed to fetch ${priority} messages:`, error);
            throw new Error('Failed to load messages');
        }
    }
}

export const broadcastService = new BroadcastService();
