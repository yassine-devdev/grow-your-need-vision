import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function checkCollections() {
    try {
        await pb.collection('_superusers').authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        
        const enrollments = await pb.collections.getOne('enrollments');
        console.log('Enrollments:', JSON.stringify(enrollments, null, 2));

    } catch (err) {
        console.error(err);
    }
}

checkCollections();
