import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const USERS = [
    {
        email: 'owner@growyourneed.com',
        password: 'Darnag123456789@',
        passwordConfirm: 'Darnag123456789@',
        name: 'Platform Owner',
        role: 'Owner'
    }
];

async function seedUsers() {
    console.log('🚀 Seeding Users Collection...');

    try {
        // Authenticate as Admin to create users
        await pb.collection('_superusers').authWithPassword('owner@growyourneed.com', 'Darnag123456789@');

        for (const user of USERS) {
            try {
                // Check if user exists
                const existing = await pb.collection('users').getList(1, 1, {
                    filter: `email = "${user.email}"`
                });

                if (existing.totalItems === 0) {
                    console.log(`   Creating user '${user.email}'...`);
                    await pb.collection('users').create({
                        email: user.email,
                        password: user.password,
                        passwordConfirm: user.passwordConfirm,
                        name: user.name,
                        role: user.role,
                        emailVisibility: true
                    });
                    console.log(`   ✅ Created user '${user.email}'`);
                } else {
                    console.log(`   ⚠️  User '${user.email}' already exists.`);
                    // Update role just in case
                    const userId = existing.items[0].id;
                    if (existing.items[0].role !== user.role) {
                         await pb.collection('users').update(userId, { role: user.role });
                         console.log(`   🔄 Updated role for '${user.email}' to '${user.role}'`);
                    }
                }
            } catch (e) {
                console.error(`   ❌ Failed to process user '${user.email}':`, e.message);
            }
        }

    } catch (e) {
        console.error("Fatal Error:", e);
    }
}

seedUsers();
