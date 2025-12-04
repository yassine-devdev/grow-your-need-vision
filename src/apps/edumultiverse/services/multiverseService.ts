import PocketBase from 'pocketbase';
import { Universe, Timeline, Mission, Glitch, MultiverseProfile, MissionRun } from '../types';

// Use existing PB instance if available globally, or create new one
// Assuming standard Vite env var for PB URL
const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

export const multiverseService = {
    // --- Universes ---
    async getUniverses(): Promise<Universe[]> {
        return await pb.collection('universes').getFullList<Universe>();
    },

    async getUniverse(id: string): Promise<Universe> {
        return await pb.collection('universes').getOne<Universe>(id);
    },

    // --- Timelines ---
    async getTimelines(universeId: string): Promise<Timeline[]> {
        return await pb.collection('timelines').getFullList<Timeline>({
            filter: `universe = "${universeId}"`,
            sort: 'difficulty'
        });
    },

    // --- Missions ---
    async getMissions(universeId: string, timelineId?: string): Promise<Mission[]> {
        let filter = `universe = "${universeId}"`;
        if (timelineId) {
            filter += ` && timeline = "${timelineId}"`;
        }
        return await pb.collection('missions').getFullList<Mission>({ filter });
    },

    async getMission(id: string): Promise<Mission> {
        return await pb.collection('missions').getOne<Mission>(id);
    },

    // --- Glitches ---
    async getGlitches(universeId?: string): Promise<Glitch[]> {
        const filter = universeId ? `universe = "${universeId}"` : '';
        return await pb.collection('glitches').getFullList<Glitch>({ filter });
    },

    // --- Profile ---
    async getProfile(userId: string): Promise<MultiverseProfile | null> {
        try {
            return await pb.collection('multiverse_profiles').getFirstListItem<MultiverseProfile>(`user = "${userId}"`);
        } catch (e) {
            return null;
        }
    },

    async createProfile(userId: string): Promise<MultiverseProfile> {
        return await pb.collection('multiverse_profiles').create<MultiverseProfile>({
            user: userId,
            totalXP: 0,
            level: 1,
            streakDays: 0,
            badges: []
        });
    },

    // --- Gameplay ---
    async completeMission(missionId: string, userId: string, score: number): Promise<MissionRun> {
        // 1. Log the run
        const run = await pb.collection('mission_runs').create<MissionRun>({
            mission: missionId,
            student: userId,
            score,
            status: score > 0 ? 'completed' : 'failed',
            completedAt: new Date().toISOString()
        });

        // 2. Update XP if successful
        if (score > 0) {
            const mission = await this.getMission(missionId);
            const profile = await this.getProfile(userId);
            if (profile) {
                await pb.collection('multiverse_profiles').update(profile.id, {
                    totalXP: profile.totalXP + (mission.xpReward || 0)
                });
            }
        }

        return run;
    }
};
