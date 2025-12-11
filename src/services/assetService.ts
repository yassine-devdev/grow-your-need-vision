import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface MarketingAsset extends RecordModel {
    title: string;
    file: string; // Filename
    type: 'Image' | 'Video' | 'Document';
    size: number;
    tags: string[];
    url?: string; // Computed URL
}

export const assetService = {
    async getAssets() {
        try {
            const records = await pb.collection('marketing_assets').getFullList<MarketingAsset>({
                sort: '-created',
                requestKey: null
            });
            return records.map(r => ({
                ...r,
                url: pb.files.getUrl(r, r.file)
            }));
        } catch (error) {
            console.error('Error fetching assets:', error);
            // Mock data for development if backend is missing
            return [
                { id: '1', title: 'Summer Banner', file: 'banner.jpg', type: 'Image', size: 1024000, tags: ['summer', 'sale'], created: new Date().toISOString(), updated: new Date().toISOString(), collectionId: 'marketing_assets', collectionName: 'marketing_assets', url: 'https://via.placeholder.com/300x200?text=Summer+Banner' },
                { id: '2', title: 'Product Demo', file: 'demo.mp4', type: 'Video', size: 5024000, tags: ['product', 'demo'], created: new Date().toISOString(), updated: new Date().toISOString(), collectionId: 'marketing_assets', collectionName: 'marketing_assets', url: 'https://via.placeholder.com/300x200?text=Video+Thumbnail' },
                { id: '3', title: 'Q1 Report', file: 'report.pdf', type: 'Document', size: 204000, tags: ['report', 'finance'], created: new Date().toISOString(), updated: new Date().toISOString(), collectionId: 'marketing_assets', collectionName: 'marketing_assets', url: 'https://via.placeholder.com/300x200?text=PDF+Document' },
            ] as MarketingAsset[];
        }
    },

    async uploadAsset(file: File, title: string, type: 'Image' | 'Video' | 'Document') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('type', type);
        formData.append('size', file.size.toString());

        return await pb.collection('marketing_assets').create(formData);
    },

    async deleteAsset(id: string) {
        return await pb.collection('marketing_assets').delete(id);
    },

    // Studio Projects
    async getProjects() {
        return await pb.collection('studio_projects').getFullList({
            sort: '-created',
            expand: 'owner'
        });
    },

    async createProject(data: any) {
        return await pb.collection('studio_projects').create(data);
    },

    async deleteProject(id: string) {
        return await pb.collection('studio_projects').delete(id);
    }
};
