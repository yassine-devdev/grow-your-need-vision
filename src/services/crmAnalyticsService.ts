/**
 * CRM Analytics Service
 * Comprehensive analytics for conversion rates and pipeline health
 */

import pb from '../lib/pocketbase';

export interface AnalyticsMetrics {
    conversion_rates: {
        lead_to_prospect: number;
        prospect_to_customer: number;
        overall: number;
    };
    pipeline_health: {
        by_stage: Record<string, number>;
        total_value: number;
        weighted_value: number;
    };
    performance: {
        avg_cycle_time: number;
        win_rate: number;
        total_deals: number;
        won_deals: number;
        lost_deals: number;
    };
}

class CRMAnalyticsService {
    async getConversionRates(): Promise<AnalyticsMetrics['conversion_rates']> {
        try {
            const contacts = await pb.collection('crm_contacts').getFullList();

            const leads = contacts.filter(c => c.status === 'lead').length;
            const prospects = contacts.filter(c => c.status === 'prospect').length;
            const customers = contacts.filter(c => c.status === 'customer').length;

            const lead_to_prospect = leads > 0 ? (prospects / leads) * 100 : 0;
            const prospect_to_customer = prospects > 0 ? (customers / prospects) * 100 : 0;
            const overall = leads > 0 ? (customers / leads) * 100 : 0;

            return {
                lead_to_prospect,
                prospect_to_customer,
                overall
            };
        } catch (error) {
            console.error('Error calculating conversion rates:', error);
            throw error;
        }
    }

    async getPipelineHealth(): Promise<AnalyticsMetrics['pipeline_health']> {
        try {
            const deals = await pb.collection('deals').getFullList();
            const openDeals = deals.filter(d => d.status === 'open');

            const by_stage: Record<string, number> = {};
            let total_value = 0;
            let weighted_value = 0;

            openDeals.forEach(deal => {
                by_stage[deal.stage] = (by_stage[deal.stage] || 0) + 1;
                total_value += deal.value || 0;
                weighted_value += deal.weighted_value || 0;
            });

            return {
                by_stage,
                total_value,
                weighted_value
            };
        } catch (error) {
            console.error('Error calculating pipeline health:', error);
            throw error;
        }
    }

    async getAverageCycleTime(): Promise<number> {
        try {
            const deals = await pb.collection('deals').getFullList();
            const closedDeals = deals.filter(d => d.actual_close_date);

            if (closedDeals.length === 0) return 0;

            const cycleTimes = closedDeals.map(deal => {
                const created = new Date(deal.created);
                const closed = new Date(deal.actual_close_date);
                return (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
            });

            return cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length;
        } catch (error) {
            console.error('Error calculating cycle time:', error);
            throw error;
        }
    }

    async getWinLossAnalysis(): Promise<AnalyticsMetrics['performance']> {
        try {
            const deals = await pb.collection('deals').getFullList();

            const won_deals = deals.filter(d => d.status === 'won').length;
            const lost_deals = deals.filter(d => d.status === 'lost').length;
            const total_deals = won_deals + lost_deals;
            const win_rate = total_deals > 0 ? (won_deals / total_deals) * 100 : 0;
            const avg_cycle_time = await this.getAverageCycleTime();

            return {
                avg_cycle_time,
                win_rate,
                total_deals,
                won_deals,
                lost_deals
            };
        } catch (error) {
            console.error('Error calculating win/loss analysis:', error);
            throw error;
        }
    }

    async getRevenueByPeriod(period: 'month' | 'quarter' | 'year'): Promise<number[]> {
        try {
            const deals = await pb.collection('deals').getFullList();
            const wonDeals = deals.filter(d => d.status === 'won');

            // Simplified: return last 12 months
            const revenue: number[] = new Array(12).fill(0);

            wonDeals.forEach(deal => {
                const closeDate = new Date(deal.actual_close_date);
                const monthIndex = closeDate.getMonth();
                revenue[monthIndex] += deal.value || 0;
            });

            return revenue;
        } catch (error) {
            console.error('Error calculating revenue:', error);
            throw error;
        }
    }
}

export const crmAnalyticsService = new CRMAnalyticsService();
