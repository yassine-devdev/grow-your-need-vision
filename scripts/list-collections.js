import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090');

async function listCollections() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL || process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD || process.env.POCKETBASE_ADMIN_PASSWORD || process.env.POCKETBASE_ADMIN_PASSWORD);
    const collections = await pb.collections.getFullList();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(c => console.log(`- ${c.name} (${c.type})`));
}

listCollections().catch(console.error);
