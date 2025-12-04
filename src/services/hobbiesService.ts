import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const hobbiesService = {
    // Creative
    getCreativeHobbies: async () => {
        return await pb.collection('hobbies_creative').getFullList();
    },

    // Collecting
    getCollections: async (userId: string) => {
        return await pb.collection('hobbies_collections').getFullList({
            filter: `user = "${userId}"`
        });
    },

    // Gaming
    getGamingStats: async (userId: string) => {
        return await pb.collection('hobbies_gaming').getFullList({
            filter: `user = "${userId}"`
        });
    }
};
