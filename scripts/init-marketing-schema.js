import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function initMarketingSchema() {
    try {
        const adminAuth = await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log('Authenticated as admin');

        // 1. Campaigns
        try {
            await pb.collections.create({
                name: 'campaigns',
                type: 'base',
                schema: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'status', type: 'select', required: true, options: { values: ['Active', 'Scheduled', 'Paused', 'Completed', 'Draft'] } },
                    { name: 'budget', type: 'number', required: true },
                    { name: 'spent', type: 'number', required: false },
                    { name: 'start_date', type: 'date', required: true },
                    { name: 'end_date', type: 'date', required: true },
                    { name: 'type', type: 'select', required: true, options: { values: ['Email', 'Social', 'Search', 'Display'] } },
                    { name: 'performance_score', type: 'number', required: false },
                    { name: 'impressions', type: 'number', required: false },
                    { name: 'clicks', type: 'number', required: false },
                    { name: 'conversions', type: 'number', required: false }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('Created campaigns collection');
        } catch (e) {
            console.log('campaigns collection might already exist');
        }

        // 2. Marketing Assets
        try {
            await pb.collections.create({
                name: 'marketing_assets',
                type: 'base',
                schema: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'file', type: 'file', required: true, options: { maxSelect: 1, maxSize: 52428800 } }, // 50MB
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

        // 3. Email Templates
        try {
            await pb.collections.create({
                name: 'email_templates',
                type: 'base',
                schema: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'subject', type: 'text', required: true },
                    { name: 'content', type: 'editor', required: true },
                    { name: 'category', type: 'text', required: false },
                    { name: 'last_used', type: 'date', required: false }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('Created email_templates collection');
        } catch (e) {
            console.log('email_templates collection might already exist');
        }

    } catch (error) {
        console.error('Failed to init marketing schema:', error);
    }
}

initMarketingSchema();
