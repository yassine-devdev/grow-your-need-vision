import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface Tool extends RecordModel {
    name: string;
    description: string;
    category: string;
    status: 'active' | 'beta' | 'maintenance';
    icon: string;
}

export interface MarketingTool extends Tool {
    campaign_count?: number;
    conversion_rate?: number;
}

export interface FinanceTool extends Tool {
    report_type?: string;
    currency?: string;
}

export interface BusinessTool extends Tool {
    rule_engine?: string;
}

export interface MarketplaceApp extends RecordModel {
    name: string;
    developer: string;
    price: number;
    rating: number;
    downloads: number;
    icon: string;
}

export interface SystemLog extends RecordModel {
    level: 'info' | 'warning' | 'error';
    message: string;
    source: string;
    timestamp: string;
}

export const toolService = {
    // Marketing Tools
    getMarketingTools: async (): Promise<MarketingTool[]> => {
        try {
            return await pb.collection('tools_marketing').getFullList<MarketingTool>();
        } catch (e) {
            console.warn("Marketing tools collection missing or empty");
            return [];
        }
    },
    
    // Finance Tools
    getFinanceTools: async (): Promise<FinanceTool[]> => {
        try {
            return await pb.collection('tools_finance').getFullList<FinanceTool>();
        } catch (e) {
            console.warn("Finance tools collection missing or empty");
            return [];
        }
    },

    // Business Tools
    getBusinessTools: async (): Promise<BusinessTool[]> => {
        try {
            return await pb.collection('tools_business').getFullList<BusinessTool>();
        } catch (e) {
            console.warn("Business tools collection missing or empty");
            return [];
        }
    },

    // Marketplace
    getMarketplaceApps: async (): Promise<MarketplaceApp[]> => {
        try {
            return await pb.collection('marketplace_apps').getFullList<MarketplaceApp>();
        } catch (e) {
            console.warn("Marketplace apps collection missing or empty");
            return [];
        }
    },

    // Logs
    getSystemLogs: async (page = 1, perPage = 50) => {
        try {
            return await pb.collection('system_logs').getList<SystemLog>(page, perPage, { sort: '-created' });
        } catch (e) {
            console.warn("System logs collection missing or empty");
            return { items: [], totalItems: 0 };
        }
    }
};
