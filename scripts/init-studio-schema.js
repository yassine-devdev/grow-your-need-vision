import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function initStudioSchema() {
    try {
        const adminAuth = await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log('Authenticated as admin');

        // 1. Marketing Assets (Studio Assets)
        try {
            await pb.collections.create({
                name: 'marketing_assets',
                type: 'base',
                schema: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'file', type: 'file', required: true },
                    { name: 'type', type: 'select', required: true, options: { values: ['Image', 'Video', 'Document'] } },
                    { name: 'size', type: 'number', required: false },
                    { name: 'tags', type: 'json', required: false }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('Created marketing_assets collection');
        } catch (e) {
            console.log('marketing_assets collection might already exist');
        }

        // 2. Studio Projects
        try {
            await pb.collections.create({
                name: 'studio_projects',
                type: 'base',
                schema: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'text', required: false },
                    { name: 'status', type: 'select', required: true, options: { values: ['Draft', 'In Progress', 'Completed'] } },
                    { name: 'owner', type: 'relation', required: true, options: { collectionId: 'users' } },
                    { name: 'assets', type: 'relation', required: false, options: { collectionId: 'marketing_assets' } }
                ],
                listRule: '@request.auth.id != ""',
                viewRule: '@request.auth.id != ""',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('Created studio_projects collection');
        } catch (e) {
            console.log('studio_projects collection might already exist');
        }

    } catch (error) {
        console.error('Failed to init studio schema:', error);
    }
}

initStudioSchema();
