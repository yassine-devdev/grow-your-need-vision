import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface Deal extends RecordModel {
    title: string;
    value: number;
    stage: 'Lead' | 'Contacted' | 'Demo Scheduled' | 'Trial' | 'Subscribed' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    description: string;
    contact_name: string;
    assigned_to: string; // User ID
    expected_close_date?: string;
    probability?: number;
}

export interface Contact extends RecordModel {
    name: string;
    email: string;
    phone: string;
    company: string;
    role: string;
    last_contact: string;
}

export interface ForecastData {
    month: string;
    projected: number;
    actual: number;
}

export const crmService = {
    async getDeals() {
        try {
            return await pb.collection('deals').getFullList<Deal>({
                requestKey: null
            });
        } catch (error) {
            console.error('Error fetching deals:', error);
            return [];
        }
    },

    async getContacts() {
        try {
            return await pb.collection('contacts').getFullList<Contact>({
                requestKey: null
            });
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return [];
        }
    },

    async getForecast() {
        try {
            // In a real app, this would aggregate deal data or fetch from a dedicated endpoint
            return await pb.collection('forecasts').getFullList<ForecastData>();
        } catch (error) {
            console.error('Error fetching forecast:', error);
            return [];
        }
    },

    async createDeal(data: Omit<Deal, keyof RecordModel>) {
        try {
            return await pb.collection('deals').create<Deal>(data);
        } catch (error) {
            console.error('Error creating deal:', error);
            throw error;
        }
    },

    async updateDealStage(id: string, stage: Deal['stage']) {
        try {
            return await pb.collection('deals').update<Deal>(id, { stage });
        } catch (error) {
            console.error('Error updating deal stage:', error);
            return null;
        }
    },

    async updateDeal(id: string, data: Partial<Deal>) {
        try {
            return await pb.collection('deals').update<Deal>(id, data);
        } catch (error) {
            console.error('Error updating deal:', error);
            return null;
        }
    },

    async deleteDeal(id: string) {
        try {
            return await pb.collection('deals').delete(id);
        } catch (error) {
            console.error('Error deleting deal:', error);
            return false;
        }
    }
};
