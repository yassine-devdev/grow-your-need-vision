import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface EmailTemplate extends RecordModel {
    name: string;
    subject: string;
    content: string; // HTML content
    category: 'Marketing' | 'Transactional' | 'Notification' | 'Newsletter';
    variables: string[]; // e.g. ['{{name}}', '{{company}}']
    thumbnail?: string;
    is_active: boolean;
}

export const emailTemplateService = {
    async getTemplates(category?: string) {
        try {
            const filter = category ? `category = "${category}"` : '';
            return await pb.collection('email_templates').getFullList<EmailTemplate>({
                filter,
                sort: '-created',
                requestKey: null
            });
        } catch (error) {
            console.error('Error fetching templates:', error);
            // Mock data
            return [
                { id: '1', name: 'Welcome Email', subject: 'Welcome to Grow Your Need!', content: '<h1>Welcome {{name}}!</h1><p>Thanks for joining.</p>', category: 'Transactional', variables: ['{{name}}'], created: new Date().toISOString(), updated: new Date().toISOString(), collectionId: '', collectionName: '', is_active: true },
                { id: '2', name: 'Monthly Newsletter', subject: 'Your Monthly Update', content: '<h1>Updates for {{month}}</h1>', category: 'Newsletter', variables: ['{{month}}'], created: new Date().toISOString(), updated: new Date().toISOString(), collectionId: '', collectionName: '', is_active: true },
                { id: '3', name: 'Sale Announcement', subject: 'Big Sale!', content: '<h1>50% Off!</h1>', category: 'Marketing', variables: [], created: new Date().toISOString(), updated: new Date().toISOString(), collectionId: '', collectionName: '', is_active: true },
            ] as EmailTemplate[];
        }
    },

    async createTemplate(data: Partial<EmailTemplate>) {
        return await pb.collection('email_templates').create(data);
    },

    async updateTemplate(id: string, data: Partial<EmailTemplate>) {
        return await pb.collection('email_templates').update(id, data);
    },

    async deleteTemplate(id: string) {
        return await pb.collection('email_templates').delete(id);
    }
};
