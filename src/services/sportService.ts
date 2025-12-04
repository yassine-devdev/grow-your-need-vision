import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const sportService = {
    // Dashboard
    getActivityLog: async (userId: string) => {
        return await pb.collection('sport_activities').getFullList({
            filter: `user = "${userId}"`,
            sort: '-date'
        });
    },

    // Teams
    getTeams: async () => {
        return await pb.collection('sport_teams').getFullList();
    },

    // Venues
    getVenues: async () => {
        return await pb.collection('sport_venues').getFullList();
    }
};
