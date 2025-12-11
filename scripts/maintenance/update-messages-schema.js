import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function updateMessagesSchema() {
    try {
        console.log('Authenticating...');
        await pb.collection('_superusers').authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        
        console.log('Fetching messages collection...');
        const collection = await pb.collections.getOne('messages');
        
        // Handle both fields (newer PB) and schema (older PB)
        const isFields = !!collection.fields;
        let schema = collection.fields || collection.schema || [];
        
        // Check if recipient_role already exists
        const exists = schema.find(f => f.name === 'recipient_role');
        if (exists) {
            console.log('recipient_role already exists.');
            return;
        }
        
        console.log('Adding recipient_role field...');
        schema.push({
            name: 'recipient_role',
            type: 'select',
            required: false,
            maxSelect: 1,
            values: ['Owner', 'Admin', 'Teacher', 'Student', 'Parent', 'All']
        });
        
        const data = {};
        if (isFields) {
            data.fields = schema;
        } else {
            data.schema = schema;
        }

        await pb.collections.update(collection.id, data);
        console.log('Messages schema updated successfully.');
        
    } catch (err) {
        console.error('Error:', err);
    }
}

updateMessagesSchema();
