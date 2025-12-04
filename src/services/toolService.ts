import pb from '../lib/pocketbase';

export const toolService = {
    // Marketing Tools
    getMarketingTools: async () => {
        try {
            return await pb.collection('tools_marketing').getFullList();
        } catch (e) {
            console.warn("Marketing tools collection missing or empty");
            return [];
        }
    },
    
    // Finance Tools
    getFinanceTools: async () => {
        try {
            return await pb.collection('tools_finance').getFullList();
        } catch (e) {
            console.warn("Finance tools collection missing or empty");
            return [];
        }
    },

    // Business Tools
    getBusinessTools: async () => {
        try {
            return await pb.collection('tools_business').getFullList();
        } catch (e) {
            console.warn("Business tools collection missing or empty");
            return [];
        }
    },

    // Marketplace
    getMarketplaceApps: async () => {
        try {
            return await pb.collection('marketplace_apps').getFullList();
        } catch (e) {
            console.warn("Marketplace apps collection missing or empty");
            return [];
        }
    },

    // Logs
    getSystemLogs: async () => {
        try {
            return await pb.collection('system_logs').getList(1, 50, { sort: '-created' });
        } catch (e) {
            console.warn("System logs collection missing or empty");
            return { items: [], totalItems: 0 };
        }
    }
};
