import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const creatorService = {
    // Designer
    getTemplates: async () => {
        return await pb.collection('creator_templates').getFullList();
    },

    // Video
    getVideoProjects: async (userId: string) => {
        return await pb.collection('creator_videos').getFullList({
            filter: `user = "${userId}"`
        });
    },

    // Coder
    getCodeProjects: async (userId: string) => {
        return await pb.collection('creator_code').getFullList({
            filter: `user = "${userId}"`
        });
    },

    // Office
    getDocuments: async (userId: string) => {
        return await pb.collection('creator_docs').getFullList({
            filter: `user = "${userId}"`
        });
    }
};
