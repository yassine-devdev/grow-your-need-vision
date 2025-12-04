import pb from '../lib/pocketbase';

export interface StorageQuota {
    used: number; // in bytes
    total: number; // in bytes
    percentage: number;
}

export const storageQuotaService = {
    /**
     * Get storage usage for a user
     */
    async getUsage(userId: string): Promise<StorageQuota> {
        try {
            // In a real app, this would be a field on the user record or a separate collection
            // For now, we'll fetch the user and look for a 'storage_used' field, 
            // or default to a random value for demo purposes if not present.
            const user = await pb.collection('users').getOne(userId);
            
            const used = user.storage_used || 450 * 1024 * 1024; // Default mock: 450MB
            const total = user.storage_limit || 1024 * 1024 * 1024; // Default limit: 1GB

            return {
                used,
                total,
                percentage: (used / total) * 100
            };
        } catch (error) {
            console.error('Error fetching storage usage:', error);
            return { used: 0, total: 1024 * 1024 * 1024, percentage: 0 };
        }
    },

    /**
     * Check if user has enough space for a file
     */
    async checkQuota(userId: string, fileSize: number): Promise<boolean> {
        const usage = await this.getUsage(userId);
        return (usage.used + fileSize) <= usage.total;
    },

    /**
     * Update storage usage (e.g. after upload or delete)
     */
    async updateUsage(userId: string, delta: number): Promise<void> {
        try {
            const usage = await this.getUsage(userId);
            const newUsed = Math.max(0, usage.used + delta);
            
            await pb.collection('users').update(userId, {
                storage_used: newUsed
            });
        } catch (error) {
            console.error('Error updating storage usage:', error);
        }
    }
};
