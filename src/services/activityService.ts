import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface Activity extends RecordModel {
    title: string;
    description?: string;
    date?: string;
    location?: string;
    type?: string;
    participants?: string[];
    maxParticipants?: number;
    cost?: number;
    organizer?: string;
}

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

    createActivity: async (data: Partial<Activity>) => {
        return await pb.collection('activities').create(data);
    }
};
