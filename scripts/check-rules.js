import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const ADMIN_EMAIL = 'owner@growyourneed.com';
const ADMIN_PASS = 'Darnag123456789@';

async function main() {
    try {
        await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASS);

        const collections = [
            'finance_transactions',
            'classes'
        ];

        for (const colName of collections) {
            const collection = await pb.collections.getOne(colName);
            console.log(`Collection: ${colName}`);
            console.log(`  listRule: "${collection.listRule}"`);
            console.log(`  viewRule: "${collection.viewRule}"`);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

main();
