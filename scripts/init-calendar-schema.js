import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function initCalendarSchema() {
    try {
        const adminAuth = await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log('Authenticated as admin');

        // 1. Calendar Events
        try {
            await pb.collections.create({
                name: 'calendar_events',
                type: 'base',
                schema: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'description', type: 'text', required: false },
                    { name: 'start', type: 'date', required: true },
                    { name: 'end', type: 'date', required: true },
                    { name: 'all_day', type: 'bool', required: false },
                    { name: 'user', type: 'relation', required: true, options: { collectionId: 'users' } },
                    { name: 'type', type: 'select', required: true, options: { values: ['Personal', 'Work', 'School', 'Holiday'] } },
                    { name: 'location', type: 'text', required: false }
                ],
                listRule: '@request.auth.id = user.id',
                viewRule: '@request.auth.id = user.id',
                createRule: '@request.auth.id = user.id',
                updateRule: '@request.auth.id = user.id',
                deleteRule: '@request.auth.id = user.id',
            });
            console.log('Created calendar_events collection');
        } catch (e) {
            console.log('calendar_events collection might already exist');
        }

    } catch (error) {
        console.error('Failed to init calendar schema:', error);
    }
}

initCalendarSchema();
