import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface MarketplaceApp extends RecordModel {
    name: string;
    provider: string;
    category: string;
    rating: number;
    installs: number;
    price: string;
    description: string;
    icon: string;
    verified: boolean;
}

export const marketplaceService = {
    async getApps() {
        try {
            return await pb.collection('marketplace_apps').getFullList<MarketplaceApp>({
                sort: '-installs',
            });
        } catch (error) {
            console.error('Error fetching marketplace apps:', error);
            return [];
        }
    }
};
