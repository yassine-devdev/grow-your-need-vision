import pb from '../lib/pocketbase';

export interface AccountSettings {
    username?: string;
    email?: string;
    name?: string;
    avatar?: string;
    // Add other user fields as needed
    [key: string]: string | number | boolean | null | undefined;
}

export const settingsService = {
    // Account Settings
    getAccountSettings: async (userId: string) => {
        return await pb.collection('users').getOne(userId);
    },

    updateAccountSettings: async (userId: string, data: AccountSettings) => {
        return await pb.collection('users').update(userId, data);
    },

    // Appearance
    getThemeSettings: async (userId: string) => {
        // Assuming user preferences are stored in a separate collection or field
        return await pb.collection('user_preferences').getFirstListItem(`user="${userId}"`);
    },

    // Configuration
    getPlatformConfig: async () => {
        return await pb.collection('platform_config').getFullList();
    }
};
