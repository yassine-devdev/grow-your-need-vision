const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        
        const collections = ['user_progress', 'user_achievements', 'gamification_achievements'];
        
        for (const name of collections) {
            try {
                const col = await pb.collections.getOne(name);
                console.log(`✅ Collection '${name}' exists (ID: ${col.id})`);
                console.log(JSON.stringify(col, null, 2));
            } catch (e) {
                console.log(`❌ Collection '${name}' does not exist (Status: ${e.status})`);
                if (e.status !== 404) console.log(e);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

main();
