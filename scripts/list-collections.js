import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function listCollections() {
    await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
    const collections = await pb.collections.getFullList();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(c => console.log(`- ${c.name} (${c.type})`));
}

listCollections().catch(console.error);
