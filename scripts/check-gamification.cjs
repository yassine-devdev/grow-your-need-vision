const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://127.0.0.1:8090');

async function check() {
    try {
        await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log('Authenticated.');

        const collections = await pb.collections.getFullList();
        console.log('Collections:', collections.map(c => c.name).join(', '));

        const achievements = await pb.collection('gamification_achievements').getFullList();
        console.log('Achievements count:', achievements.length);

    } catch (e) {
        console.error('Check failed:', e);
    }
}

check();
