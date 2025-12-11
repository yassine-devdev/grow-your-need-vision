import pb from '../lib/pocketbase';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'Learning' | 'Social' | 'Activity' | 'Milestone';
    xp_reward: number;
    requirement_type: 'count' | 'score' | 'streak';
    requirement_value: number;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    created: string;
}

export interface UserAchievement {
    id: string;
    user: string;
    achievement: string;
    unlocked_at: string;
    progress: number;
    completed: boolean;
    created: string;
}

export interface LeaderboardEntry {
    id: string;
    user: string;
    total_xp: number;
    level: number;
    achievements_count: number;
    rank: number;
    username: string;
    avatar_url?: string;
}

export interface Reward {
    id: string;
    name: string;
    description: string;
    cost_xp: number;
    category: 'Avatar' | 'Theme' | 'Badge' | 'Power-Up';
    icon: string;
    available: boolean;
    created: string;
}

export interface UserReward {
    id: string;
    user: string;
    reward: string;
    purchased_at: string;
    equipped: boolean;
}

export const gamificationService = {
    // Achievements
    getAllAchievements: async () => {
        return await pb.collection('gamification_achievements').getFullList<Achievement>({
            sort: '-xp_reward'
        });
    },

    createAchievement: async (data: Partial<Achievement>) => {
        return await pb.collection('gamification_achievements').create(data);
    },

    updateAchievement: async (id: string, data: Partial<Achievement>) => {
        return await pb.collection('gamification_achievements').update(id, data);
    },

    getUserAchievements: async (userId: string) => {
        return await pb.collection('user_achievements').getFullList<UserAchievement>({
            filter: `user = "${userId}"`,
            expand: 'achievement',
            sort: '-unlocked_at'
        });
    },

    unlockAchievement: async (userId: string, achievementId: string) => {
        return await pb.collection('user_achievements').create({
            user: userId,
            achievement: achievementId,
            completed: true,
            progress: 100,
            unlocked_at: new Date().toISOString()
        });
    },

    updateAchievementProgress: async (userAchievementId: string, progress: number) => {
        return await pb.collection('user_achievements').update(userAchievementId, {
            progress
        });
    },

    // Leaderboard
    getGlobalLeaderboard: async (limit: number = 100) => {
        try {
            const users = await pb.collection('gamification_progress').getFullList({
                sort: '-current_xp',
                limit,
                expand: 'user'
            });

            return users.map((entry: any, index: number) => ({
                id: entry.id,
                user: entry.user,
                total_xp: entry.current_xp || 0,
                level: entry.level || 1,
                achievements_count: entry.achievements_unlocked || 0,
                rank: index + 1,
                username: entry.expand?.user?.name || 'Unknown',
                avatar_url: entry.expand?.user?.avatar
            }));
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            return [];
        }
    },

    getUserRank: async (userId: string) => {
        try {
            const allUsers = await pb.collection('user_progress').getFullList({
                sort: '-current_xp'
            });

            const userIndex = allUsers.findIndex((u: any) => u.user === userId);
            return userIndex >= 0 ? userIndex + 1 : null;
        } catch (error) {
            console.error('Failed to get user rank:', error);
            return null;
        }
    },

    // Rewards Store
    getAllRewards: async () => {
        return await pb.collection('gamification_rewards').getFullList<Reward>({
            filter: 'available = true',
            sort: 'cost_xp'
        });
    },

    createReward: async (data: Partial<Reward>) => {
        return await pb.collection('gamification_rewards').create(data);
    },

    updateReward: async (id: string, data: Partial<Reward>) => {
        return await pb.collection('gamification_rewards').update(id, data);
    },

    getUserRewards: async (userId: string) => {
        return await pb.collection('user_rewards').getFullList<UserReward>({
            filter: `user = "${userId}"`,
            expand: 'reward',
            sort: '-purchased_at'
        });
    },

    purchaseReward: async (userId: string, rewardId: string, costXp: number) => {
        // This should be a transaction in production
        // 1. Deduct XP from user
        // 2. Add reward to user_rewards

        const progress = await pb.collection('user_progress').getFirstListItem(
            `user = "${userId}"`
        );

        if (progress.current_xp < costXp) {
            throw new Error('Insufficient XP');
        }

        // Decrement XP
        await pb.collection('user_progress').update(progress.id, {
            current_xp: progress.current_xp - costXp
        });

        // Add reward
        return await pb.collection('user_rewards').create({
            user: userId,
            reward: rewardId,
            purchased_at: new Date().toISOString(),
            equipped: false
        });
    },

    equipReward: async (userRewardId: string) => {
        return await pb.collection('user_rewards').update(userRewardId, {
            equipped: true
        });
    },

    // Challenges (Daily/Weekly)
    getActiveChallenges: async (userId: string) => {
        return await pb.collection('gamification_challenges').getFullList({
            filter: `status = "Active" && (target_user = "${userId}" || target_user = "")`,
            sort: '-created'
        });
    },

    completeChallenge: async (challengeId: string, userId: string) => {
        return await pb.collection('challenge_completions').create({
            challenge: challengeId,
            user: userId,
            completed_at: new Date().toISOString()
        });
    }
};
