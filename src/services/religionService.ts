import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const religionService = {
    // Quran
    getQuranProgress: async (userId: string) => {
        return await pb.collection('religion_quran_progress').getFirstListItem(`user="${userId}"`);
    },

    // Prayer
    getPrayerTimes: async (location: string) => {
        return await pb.collection('religion_prayer_times').getFirstListItem(`location="${location}"`);
    },

    // Community
    getMosques: async () => {
        return await pb.collection('religion_mosques').getFullList();
    }
};
