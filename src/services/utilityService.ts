import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface UtilityTool extends RecordModel {
    name: string;
    description: string;
    icon: string;
    url?: string;
    category: string;
    is_active: boolean;
}

export const utilityService = {
    // Dev Essentials
    getDevTools: async (): Promise<UtilityTool[]> => {
        return await pb.collection('utils_dev').getFullList<UtilityTool>();
    },

    // Design & Media
    getDesignTools: async (): Promise<UtilityTool[]> => {
        return await pb.collection('utils_design').getFullList<UtilityTool>();
    },

    // General Utilities
    getGeneralUtilities: async (): Promise<UtilityTool[]> => {
        return await pb.collection('utils_general').getFullList<UtilityTool>();
    },

    // Resources
    getResources: async (): Promise<UtilityTool[]> => {
        return await pb.collection('utils_resources').getFullList<UtilityTool>();
    }
};
