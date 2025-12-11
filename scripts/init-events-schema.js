import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function initEventsSchema() {
    try {
        const adminAuth = await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log('Authenticated as admin');

        // 1. Events
        try {
            await pb.collections.create({
                name: 'events',
                type: 'base',
                schema: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'editor', required: true },
                    { name: 'start_time', type: 'date', required: true },
                    { name: 'end_time', type: 'date', required: true },
                    { name: 'location', type: 'text', required: false },
                    { name: 'organizer', type: 'relation', required: false, options: { collectionId: 'users' } },
                    { name: 'type', type: 'select', required: true, options: { values: ['Academic', 'Social', 'Sports', 'Other'] } },
                    { name: 'capacity', type: 'number', required: false },
                    { name: 'image', type: 'file', required: false }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('Created events collection');
        } catch (e) {
            console.log('events collection might already exist');
        }

    } catch (error) {
        console.error('Failed to init events schema:', error);
    }
}

initEventsSchema();
