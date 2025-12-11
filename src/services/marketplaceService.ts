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
    },

    async getMyApps(userId: string) {
        try {
            return await pb.collection('marketplace_apps').getFullList<MarketplaceApp>({
                filter: `provider = "${userId}"`,
                sort: '-created',
            });
        } catch (error) {
            console.error('Error fetching my apps:', error);
            return [];
        }
    },

    async submitApp(data: Partial<MarketplaceApp>) {
        try {
            return await pb.collection('marketplace_apps').create(data);
        } catch (error) {
            console.error('Error submitting app:', error);
            throw error;
        }
    }
};
