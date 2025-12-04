import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const gamificationService = {
    // Achievements
    getBadges: async (userId: string) => {
        return await pb.collection('gamification_badges').getFullList({
            filter: `user = "${userId}"`
        });
    },

    // Leaderboards
    getLeaderboard: async () => {
        return await pb.collection('gamification_leaderboard').getList(1, 100, { sort: '-score' });
    },

    // Rewards
    getRewards: async () => {
        return await pb.collection('gamification_rewards').getFullList();
    }
};
