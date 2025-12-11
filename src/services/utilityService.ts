import pb from '../lib/pocketbase';

export const utilityService = {
    // Dev Essentials
    getDevTools: async () => {
        return await pb.collection('utils_dev').getFullList();
    },

    // Design & Media
    getDesignTools: async () => {
        return await pb.collection('utils_design').getFullList();
    },

    // General Utilities
    getGeneralUtilities: async () => {
        return await pb.collection('utils_general').getFullList();
    },

    // Resources
    getResources: async () => {
        return await pb.collection('utils_resources').getFullList();
    }
};
