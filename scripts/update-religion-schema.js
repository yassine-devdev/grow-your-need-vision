import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function updateReligionSchema() {
    try {
        await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log('✅ Authenticated as admin');

        // 1. Names of Allah Collection
        try {
            await pb.collections.create({
                name: 'names_of_allah',
                type: 'base',
                schema: [
                    { name: 'number', type: 'number', required: true },
                    { name: 'arabic', type: 'text', required: true },
                    { name: 'transliteration', type: 'text', required: true },
                    { name: 'meaning', type: 'text', required: true },
                    { name: 'description', type: 'editor', required: false }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('✅ Created names_of_allah collection');
        } catch (e) {
            console.log('ℹ️ names_of_allah collection might already exist');
        }

        // 2. Duas Collection
        try {
            await pb.collections.create({
                name: 'duas',
                type: 'base',
                schema: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'arabic', type: 'text', required: true },
                    { name: 'transliteration', type: 'text', required: false },
                    { name: 'translation', type: 'text', required: true },
                    { name: 'category', type: 'select', options: { values: ['Morning', 'Evening', 'Travel', 'Home', 'Prayer', 'General'] }, required: true },
                    { name: 'reference', type: 'text', required: false }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('✅ Created duas collection');
        } catch (e) {
            console.log('ℹ️ duas collection might already exist');
        }

    } catch (e) {
        console.error('❌ Error:', e);
    }
}

updateReligionSchema();
