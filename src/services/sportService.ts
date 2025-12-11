import PocketBase from 'pocketbase';
import pb from '../lib/pocketbase';

export interface SportActivity {
    id: string;
    user: string;
    sport: string;
    activity_type: 'Training' | 'Match' | 'Practice';
    duration: number; // minutes
    calories: number;
    date: string;
    notes?: string;
    created: string;
}

export interface SportTeam {
    id: string;
    name: string;
    sport: string;
    league?: string;
    logo_url?: string;
    wins: number;
    losses: number;
    draws: number;
    points: number;
    members: string[]; // User IDs
    coach?: string; // User ID
    created: string;
}

export interface SportMatch {
    id: string;
    team_home: string; // Team ID
    team_away: string; // Team ID
    score_home: number;
    score_away: number;
    status: 'Scheduled' | 'Live' | 'Finished' | 'Cancelled';
    match_date: string;
    venue?: string; // Venue ID
    sport: string;
    created: string;
}

export interface SportVenue {
    id: string;
    name: string;
    address: string;
    capacity?: number;
    sport_types: string[];
    facilities: string[];
    booking_available: boolean;
    created: string;
}

export interface PlayerStats {
    id: string;
    user: string;
    sport: string;
    games_played: number;
    goals?: number;
    assists?: number;
    points?: number;
    season: string;
    created: string;
}

export const sportService = {
    // Activity Logging
    getActivityLog: async (userId: string) => {
        return await pb.collection('sport_activities').getFullList<SportActivity>({
            filter: `user = "${userId}"`,
            sort: '-date'
        });
    },

    createActivity: async (data: Partial<SportActivity>) => {
        return await pb.collection('sport_activities').create(data);
    },

    updateActivity: async (id: string, data: Partial<SportActivity>) => {
        return await pb.collection('sport_activities').update(id, data);
    },

    deleteActivity: async (id: string) => {
        return await pb.collection('sport_activities').delete(id);
    },

    // Teams
    getTeams: async (sport?: string) => {
        try {
            const filter = sport ? `sport = "${sport}"` : '';
            const result = await pb.collection('sport_teams').getFullList<SportTeam>({
                filter,
                sort: '-points'
            });
            return result;
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            return [];
        }
    },

    getTeamById: async (id: string) => {
        return await pb.collection('sport_teams').getOne<SportTeam>(id, {
            expand: 'members,coach'
        });
    },

    createTeam: async (data: Partial<SportTeam>) => {
        return await pb.collection('sport_teams').create(data);
    },

    updateTeam: async (id: string, data: Partial<SportTeam>) => {
        return await pb.collection('sport_teams').update(id, data);
    },

    // Matches
    getMatches: async (sport?: string, status?: string) => {
        let filters = [];
        if (sport) filters.push(`sport = "${sport}"`);
        if (status) filters.push(`status = "${status}"`);

        return await pb.collection('sport_matches').getFullList<SportMatch>({
            filter: filters.join(' && '),
            sort: '-match_date',
            expand: 'team_home,team_away,venue'
        });
    },

    getLiveMatches: async () => {
        try {
            const result = await pb.collection('sport_matches').getFullList<SportMatch>({
                filter: 'status = "Live"',
                expand: 'team_home,team_away'
            });
            return result;
        } catch (error) {
            console.error('Failed to fetch live matches:', error);
            return [];
        }
    },

    getUpcomingMatches: async (sport?: string) => {
        try {
            const filter = sport
                ? `status = "Scheduled" && sport = "${sport}"`
                : 'status = "Scheduled"';

            const result = await pb.collection('sport_matches').getFullList<SportMatch>({
                filter,
                sort: 'match_date',
                expand: 'team_home,team_away,venue'
            });
            return result;
        } catch (error) {
            console.error('Failed to fetch upcoming matches:', error);
            return [];
        }
    },

    createMatch: async (data: Partial<SportMatch>) => {
        return await pb.collection('sport_matches').create(data);
    },

    updateMatch: async (id: string, data: Partial<SportMatch>) => {
        return await pb.collection('sport_matches').update(id, data);
    },

    // Venues
    getVenues: async (sportType?: string) => {
        const filter = sportType ? `sport_types ~ "${sportType}"` : '';
        return await pb.collection('sport_venues').getFullList<SportVenue>({
            filter
        });
    },

    getVenueById: async (id: string) => {
        return await pb.collection('sport_venues').getOne<SportVenue>(id);
    },

    createVenue: async (data: Partial<SportVenue>) => {
        return await pb.collection('sport_venues').create(data);
    },

    // Player Stats
    getPlayerStats: async (userId: string, sport?: string) => {
        const filter = sport
            ? `user = "${userId}" && sport = "${sport}"`
            : `user = "${userId}"`;

        return await pb.collection('player_stats').getFullList<PlayerStats>({
            filter,
            sort: '-season'
        });
    },

    updatePlayerStats: async (id: string, data: Partial<PlayerStats>) => {
        return await pb.collection('player_stats').update(id, data);
    },

    // Leaderboard
    getLeaderboard: async (sport: string, stat: 'goals' | 'assists' | 'points') => {
        return await pb.collection('player_stats').getFullList<PlayerStats>({
            filter: `sport = "${sport}"`,
            sort: `-${stat}`,
            expand: 'user'
        });
    }
};
