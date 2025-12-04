import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const ADMIN_EMAIL = 'owner@growyourneed.com';
const ADMIN_PASS = 'Darnag123456789@';

async function main() {
    try {
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);

        const collection = await pb.collections.getOne('finance_transactions');
        console.log(JSON.stringify(collection, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

main();
