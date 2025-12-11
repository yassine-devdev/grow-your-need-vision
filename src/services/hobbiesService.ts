import pb from '../lib/pocketbase';

export interface HobbyProject {
    id: string;
    user: string;
    title: string;
    description: string;
    category: 'Arts & Crafts' | 'Collections' | 'Gaming' | 'Music' | 'Sports' | 'Technology' | 'Other';
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    progress: number; // 0-100
    start_date: string;
    target_completion?: string;
    time_spent: number; // minutes
    image_url?: string;
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
    tags: string[];
    created: string;
}

export interface HobbyResource {
    id: string;
    title: string;
    description: string;
    category: string;
    resource_type: 'Tutorial' | 'Tool' | 'Article' | 'Video' | 'Community';
    url?: string;
    rating: number;
    created: string;
}

export interface HobbySkill {
    id: string;
    user: string;
    skill_name: string;
    category: string;
    proficiency: 'Novice' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    years_experience: number;
    projects_completed: number;
    created: string;
}

export const hobbiesService = {
    // Projects
    getUserProjects: async (userId: string) => {
        return await pb.collection('hobby_projects').getFullList<HobbyProject>({
            filter: `user = "${userId}"`,
            sort: '-created'
        });
    },

    getProjectsByCategory: async (userId: string, category: string) => {
        return await pb.collection('hobby_projects').getFullList<HobbyProject>({
            filter: `user = "${userId}" && category = "${category}"`,
            sort: '-progress'
        });
    },

    createProject: async (data: Partial<HobbyProject>) => {
        return await pb.collection('hobby_projects').create(data);
    },

    updateProject: async (id: string, data: Partial<HobbyProject>) => {
        return await pb.collection('hobby_projects').update(id, data);
    },

    updateProgress: async (id: string, progress: number) => {
        return await pb.collection('hobby_projects').update(id, { progress });
    },

    deleteProject: async (id: string) => {
        return await pb.collection('hobby_projects').delete(id);
    },

    // Resources
    getResources: async (category?: string) => {
        const filter = category ? `category = "${category}"` : '';
        return await pb.collection('hobby_resources').getFullList<HobbyResource>({
            filter,
            sort: '-rating'
        });
    },

    createResource: async (data: Partial<HobbyResource>) => {
        return await pb.collection('hobby_resources').create(data);
    },

    deleteResource: async (id: string) => {
        return await pb.collection('hobby_resources').delete(id);
    },

    searchResources: async (query: string) => {
        return await pb.collection('hobby_resources').getFullList<HobbyResource>({
            filter: `title ~ "${query}" || description ~ "${query}"`,
            sort: '-rating'
        });
    },

    // Skills
    getUserSkills: async (userId: string) => {
        return await pb.collection('hobby_skills').getFullList<HobbySkill>({
            filter: `user = "${userId}"`,
            sort: '-years_experience'
        });
    },

    addSkill: async (data: Partial<HobbySkill>) => {
        return await pb.collection('hobby_skills').create(data);
    },

    updateSkill: async (id: string, data: Partial<HobbySkill>) => {
        return await pb.collection('hobby_skills').update(id, data);
    },

    // Statistics
    getHobbyStats: async (userId: string) => {
        try {
            const projects = await pb.collection('hobby_projects').getFullList({
                filter: `user = "${userId}"`
            });

            return {
                total_projects: projects.length,
                completed: projects.filter((p: any) => p.status === 'Completed').length,
                in_progress: projects.filter((p: any) => p.status === 'In Progress').length,
                total_time: projects.reduce((sum: number, p: any) => sum + (p.time_spent || 0), 0)
            };
        } catch (error) {
            console.error('Failed to get hobby stats:', error);
            return {
                total_projects: 0,
                completed: 0,
                in_progress: 0,
                total_time: 0
            };
        }
    }
};
