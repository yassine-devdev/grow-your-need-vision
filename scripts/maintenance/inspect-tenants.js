import PocketBase from 'pocketbase';

const client = new PocketBase('http://127.0.0.1:8090');

async function inspect() {
    try {
        await client.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        
        const collection = await client.collections.getFirstListItem('name="tenants"');
        console.log("Tenants Collection Schema:");
        console.log(JSON.stringify(collection, null, 2));

    } catch (err) {
        console.error(err);
    }
}

inspect();
