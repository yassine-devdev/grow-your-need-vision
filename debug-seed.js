
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function debug() {
    try {
        await pb.collection('_superusers').authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log('Authenticated.');

        try {
            const owner = await pb.collection('users').getFirstListItem('role = "Owner"');
            console.log('Owner found:', owner.id);
        } catch (e) {
            console.error('Error finding owner:', e);
        }

        try {
            const msgs = await pb.collection('chat_messages').getList(1, 1);
            console.log('Chat messages collection exists.');
        } catch (e) {
            console.error('Error accessing chat_messages:', e);
        }

    } catch (e) {
        console.error('Fatal:', e);
    }
}

debug();
