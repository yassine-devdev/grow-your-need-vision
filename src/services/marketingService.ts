import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';
import { isMockEnv } from '../utils/mockData';

export interface Campaign extends RecordModel {
    name: string;
    status: 'Active' | 'Scheduled' | 'Paused' | 'Completed' | 'Draft';
    budget: number;
    spent: number;
    start_date: string;
    end_date: string;
    type: 'Email' | 'Social' | 'Search' | 'Display';
    performance_score: number; // 0-100
    impressions: number;
    clicks: number;
    conversions: number;
}

export const marketingService = {
    async getCampaigns() {
        if (isMockEnv()) {
            const now = new Date();
            return [
                { id: 'mock-camp-1', collectionId: 'mock', collectionName: 'campaigns', created: now.toISOString(), updated: now.toISOString(), name: 'Back-to-School Push', status: 'Active', budget: 5000, spent: 2200, start_date: now.toISOString(), end_date: new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString(), type: 'Email', performance_score: 78, impressions: 120000, clicks: 8600, conversions: 420 },
                { id: 'mock-camp-2', collectionId: 'mock', collectionName: 'campaigns', created: now.toISOString(), updated: now.toISOString(), name: 'STEM Webinar Series', status: 'Scheduled', budget: 3000, spent: 0, start_date: new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString(), end_date: new Date(now.getTime() + 20 * 24 * 3600 * 1000).toISOString(), type: 'Social', performance_score: 0, impressions: 0, clicks: 0, conversions: 0 },
            ] as Campaign[];
        }
        try {
            return await pb.collection('campaigns').getFullList<Campaign>({
                sort: '-created',
                requestKey: null
            });
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            return [];
        }
    },

    async createCampaign(data: Partial<Campaign>) {
        return await pb.collection('campaigns').create(data);
    },

    async updateCampaign(id: string, data: Partial<Campaign>) {
        return await pb.collection('campaigns').update(id, data);
    },

    async deleteCampaign(id: string) {
        return await pb.collection('campaigns').delete(id);
    },

    // Segments
    async getSegments() {
        if (isMockEnv()) {
            return [
                { id: '1', collectionId: 'mock', collectionName: 'marketing_segments', created: '', updated: '', name: 'High Value Customers', type: 'Dynamic', count: 2840, criteria: { ltv_gt: 500 } },
                { id: '2', collectionId: 'mock', collectionName: 'marketing_segments', created: '', updated: '', name: 'Churn Risk', type: 'Dynamic', count: 856, criteria: { engagement_score_lt: 30 } },
                { id: '3', collectionId: 'mock', collectionName: 'marketing_segments', created: '', updated: '', name: 'Newsletter Subscribers', type: 'Static', count: 15402, criteria: {} },
            ] as unknown as Segment[];
        }
        try {
            return await pb.collection('marketing_segments').getFullList<Segment>({
                sort: '-created'
            });
        } catch (error) {
            console.error('Error fetching segments:', error);
            // Mock data fallback if collection doesn't exist yet
            return [
                { id: '1', name: 'High Value Customers', type: 'Dynamic', count: 2840, criteria: { ltv_gt: 500 } },
                { id: '2', name: 'Churn Risk', type: 'Dynamic', count: 856, criteria: { engagement_score_lt: 30 } },
                { id: '3', name: 'Newsletter Subscribers', type: 'Static', count: 15402, criteria: {} },
            ] as unknown as Segment[];
        }
    },

    async createSegment(data: Partial<Segment>) {
        return await pb.collection('marketing_segments').create(data);
    }
};

export interface Segment extends RecordModel {
    name: string;
    type: 'Dynamic' | 'Static';
    count: number;
    criteria: any;
    last_calculated?: string;
}
