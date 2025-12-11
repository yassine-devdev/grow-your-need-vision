import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface BusinessPlan extends RecordModel {
    name: string;
    price: number;
    billing_cycle: 'Monthly' | 'Yearly';
    features: string[];
    user_limit: number;
    adoption_rate: number;
    is_active: boolean;
}

export interface BusinessRule extends RecordModel {
    name: string;
    trigger: string;
    action: string;
    status: 'Active' | 'Paused' | 'Draft';
    last_run?: string;
}

export interface CustomerSegment extends RecordModel {
    name: string;
    criteria: any;
    count: number;
    growth: string;
    color: string;
}

export const businessService = {
    // Plans
    async getPlans() {
        try {
            return await pb.collection('business_plans').getFullList<BusinessPlan>({
                sort: 'price',
            });
        } catch (error) {
            console.error('Error fetching plans:', error);
            return [];
        }
    },

    async createPlan(data: Partial<BusinessPlan>) {
        return await pb.collection('business_plans').create(data);
    },

    // Rules
    async getRules() {
        try {
            return await pb.collection('business_rules').getFullList<BusinessRule>({
                sort: '-created',
            });
        } catch (error) {
            console.error('Error fetching rules:', error);
            return [];
        }
    },

    async createRule(data: Partial<BusinessRule>) {
        return await pb.collection('business_rules').create(data);
    },

    async updateRuleStatus(id: string, status: BusinessRule['status']) {
        return await pb.collection('business_rules').update(id, { status });
    },

    // Segments
    async getSegments() {
        try {
            return await pb.collection('customer_segments').getFullList<CustomerSegment>({
                sort: '-count',
            });
        } catch (error) {
            console.error('Error fetching segments:', error);
            return [];
        }
    },

    async createSegment(data: Partial<CustomerSegment>) {
        return await pb.collection('customer_segments').create(data);
    }
};
