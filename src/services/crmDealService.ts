/**
 * CRM Deal Enhancements Service
 * Enhanced deal management with value, probability, and close dates
 */

import pb from '../lib/pocketbase';
import { auditLogger } from './auditLogger';

export interface Deal {
    id: string;
    title: string;
    contact_id: string;
    stage: string;
    value: number;
    currency: string;
    probability: number;
    weighted_value: number;
    expected_close_date: string;
    actual_close_date?: string;
    status: 'open' | 'won' | 'lost' | 'cancelled';
    created: string;
    updated: string;
}

class CRMDealService {
    private collection = 'deals';

    async getAllDeals(): Promise<Deal[]> {
        try {
            return await pb.collection(this.collection).getFullList<Deal>({
                sort: '-created',
                expand: 'contact_id'
            });
        } catch (error) {
            console.error('Error fetching deals:', error);
            throw error;
        }
    }

    async getDealById(id: string): Promise<Deal> {
        try {
            return await pb.collection(this.collection).getOne<Deal>(id, {
                expand: 'contact_id'
            });
        } catch (error) {
            console.error('Error fetching deal:', error);
            throw error;
        }
    }

    async createDeal(data: Partial<Deal>): Promise<Deal> {
        try {
            const weighted_value = this.calculateWeightedValue(data.value || 0, data.probability || 0);
            const deal = await pb.collection(this.collection).create<Deal>({
                ...data,
                weighted_value,
                currency: data.currency || 'USD',
                status: 'open'
            });
            await auditLogger.log('dealCreate', { deal_id: deal.id, title: deal.title });
            return deal;
        } catch (error) {
            console.error('Error creating deal:', error);
            throw error;
        }
    }

    async updateDealValue(id: string, value: number, currency: string = 'USD'): Promise<Deal> {
        try {
            const deal = await this.getDealById(id);
            const weighted_value = this.calculateWeightedValue(value, deal.probability);
            const updated = await pb.collection(this.collection).update<Deal>(id, {
                value,
                currency,
                weighted_value
            });
            await auditLogger.log('dealValueUpdate', { deal_id: id, value, currency });
            return updated;
        } catch (error) {
            console.error('Error updating deal value:', error);
            throw error;
        }
    }

    async updateProbability(id: string, probability: number): Promise<Deal> {
        try {
            const deal = await this.getDealById(id);
            const weighted_value = this.calculateWeightedValue(deal.value, probability);
            const updated = await pb.collection(this.collection).update<Deal>(id, {
                probability,
                weighted_value
            });
            await auditLogger.log('dealProbabilityUpdate', { deal_id: id, probability });
            return updated;
        } catch (error) {
            console.error('Error updating probability:', error);
            throw error;
        }
    }

    async updateCloseDate(id: string, expected_close_date: string): Promise<Deal> {
        try {
            const updated = await pb.collection(this.collection).update<Deal>(id, {
                expected_close_date
            });
            await auditLogger.log('dealCloseDateUpdate', { deal_id: id, date: expected_close_date });
            return updated;
        } catch (error) {
            console.error('Error updating close date:', error);
            throw error;
        }
    }

    async markDealWon(id: string): Promise<Deal> {
        try {
            const updated = await pb.collection(this.collection).update<Deal>(id, {
                status: 'won',
                actual_close_date: new Date().toISOString(),
                probability: 100
            });
            await auditLogger.log('dealWon', { deal_id: id });
            return updated;
        } catch (error) {
            console.error('Error marking deal won:', error);
            throw error;
        }
    }

    async markDealLost(id: string): Promise<Deal> {
        try {
            const updated = await pb.collection(this.collection).update<Deal>(id, {
                status: 'lost',
                actual_close_date: new Date().toISOString(),
                probability: 0
            });
            await auditLogger.log('dealLost', { deal_id: id });
            return updated;
        } catch (error) {
            console.error('Error marking deal lost:', error);
            throw error;
        }
    }

    calculateWeightedValue(value: number, probability: number): number {
        return value * (probability / 100);
    }

    async getDealsByCloseDate(startDate: Date, endDate: Date): Promise<Deal[]> {
        try {
            const deals = await this.getAllDeals();
            return deals.filter(deal => {
                const closeDate = new Date(deal.expected_close_date);
                return closeDate >= startDate && closeDate <= endDate;
            });
        } catch (error) {
            console.error('Error fetching deals by close date:', error);
            throw error;
        }
    }

    async getForecastedRevenue(month: number, year: number): Promise<number> {
        try {
            const deals = await this.getAllDeals();
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const monthDeals = deals.filter(deal => {
                const closeDate = new Date(deal.expected_close_date);
                return closeDate >= startDate && closeDate <= endDate && deal.status === 'open';
            });

            return monthDeals.reduce((sum, deal) => sum + deal.weighted_value, 0);
        } catch (error) {
            console.error('Error calculating forecasted revenue:', error);
            throw error;
        }
    }

    async deleteDeal(id: string): Promise<boolean> {
        try {
            await pb.collection(this.collection).delete(id);
            await auditLogger.log('dealDelete', { deal_id: id });
            return true;
        } catch (error) {
            console.error('Error deleting deal:', error);
            throw error;
        }
    }
}

export const crmDealService = new CRMDealService();
