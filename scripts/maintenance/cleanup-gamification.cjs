const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    try {
        await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        
        const collections = [
            'user_progress', 
            'user_achievements', 
            'gamification_achievements',
            'user_mission_completions',
            'user_glitch_fixes',
            'universes',
            'timelines',
            'missions',
            'glitches'
        ];
        
        for (const name of collections) {
            try {
                await pb.collections.delete(name);
                console.log(`✅ Deleted '${name}'`);
            } catch (e) {
                console.log(`⚠️  Could not delete '${name}': ${e.message}`);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

main();
