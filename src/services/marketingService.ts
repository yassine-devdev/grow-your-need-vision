import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

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
    }
};
