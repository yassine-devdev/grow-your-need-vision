import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const activityService = {
    // Local Activities
    getLocalActivities: async () => {
        return await pb.collection('activities_local').getFullList();
    },

    // Social Groups
    getSocialGroups: async () => {
        return await pb.collection('social_groups').getFullList();
    },

    // Planning
    getPlannedEvents: async (userId: string) => {
        return await pb.collection('planned_events').getFullList({
            filter: `user = "${userId}"`
        });
    },

    createActivity: async (data: any) => {
        return await pb.collection('activities').create(data);
    }
};
