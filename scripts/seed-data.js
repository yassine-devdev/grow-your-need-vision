import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'owner@growyourneed.com';
const ADMIN_PASS = process.env.PB_ADMIN_PASS || 'Darnag123456789@';

async function main() {
    try {
        console.log(`Authenticating as ${ADMIN_EMAIL}...`);
        await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASS);

        // 1. Create Users
        console.log('Seeding Users...');
        const users = [
            { username: 'owner1', email: 'owner@growyourneed.com', emailVisibility: true, password: 'Darnag12345678@', passwordConfirm: 'Darnag12345678@', name: 'Owner', role: 'Owner' },
            { username: 'admin1', email: 'admin@school.com', emailVisibility: true, password: '12345678', passwordConfirm: '12345678', name: 'School Admin', role: 'Admin' },
            { username: 'parent1', email: 'parent@school.com', emailVisibility: true, password: '123456788', passwordConfirm: '123456788', name: 'Parent User', role: 'Parent' },
            { username: 'student1', email: 'student@school.com', emailVisibility: true, password: '12345678', passwordConfirm: '12345678', name: 'John Doe', role: 'Student' },
            { username: 'teacher1', email: 'teacher@school.com', emailVisibility: true, password: '123456789', passwordConfirm: '123456789', name: 'Sarah Smith', role: 'Teacher' },
            { username: 'individual1', email: 'individual@individual.com', emailVisibility: true, password: '12345678', passwordConfirm: '12345678', name: 'Individual User', role: 'Individual' },
        ];

        const createdUsers = {};

        for (const u of users) {
            try {
                const record = await pb.collection('users').create(u);
                createdUsers[u.username] = record.id;
                console.log(`Created user: ${u.username}`);
            } catch (e) {
                console.log(`User ${u.username} might already exist. Updating...`);
                try {
                    const existing = await pb.collection('users').getFirstListItem(`email="${u.email}"`);
                    createdUsers[u.username] = existing.id;
                    // Update password and details
                    await pb.collection('users').update(existing.id, {
                        password: u.password,
                        passwordConfirm: u.passwordConfirm,
                        name: u.name,
                        role: u.role
                    });
                    console.log(`Updated user: ${u.username}`);
                } catch (err) {
                    console.error(`Failed to update user ${u.username}:`, err);
                }
            }
        }

        // 2. Create Messages
        console.log('Seeding Messages...');
        const messages = [
            { sender: createdUsers['teacher1'], recipient: createdUsers['student1'], subject: 'Project Update', content: 'Keep up the good work!', folder: 'inbox', isRead: false },
            { sender: createdUsers['admin1'], recipient: createdUsers['student1'], subject: 'School Event', content: 'Don\'t forget the assembly tomorrow.', folder: 'inbox', isRead: true },
            { sender: createdUsers['student1'], recipient: createdUsers['teacher1'], subject: 'Question', content: 'Can we meet after class?', folder: 'sent', isRead: true },
        ];

        for (const m of messages) {
            if (m.sender && m.recipient) {
                await pb.collection('messages').create(m);
            }
        }

        // 3. Create Classes
        console.log('Seeding Classes...');
        const classes = [
            { name: 'Mathematics 101', code: 'MATH101', teacher: createdUsers['teacher1'], schedule: 'Mon/Wed 10:00 AM', room: 'Room 304' },
            { name: 'Physics 202', code: 'PHYS202', teacher: createdUsers['teacher1'], schedule: 'Tue/Thu 02:00 PM', room: 'Lab 1' },
        ];

        for (const c of classes) {
            if (c.teacher) {
                await pb.collection('classes').create(c);
            }
        }

        // 4. Create Finance Transactions
        console.log('Seeding Finance...');
        const transactions = [
            { type: 'income', amount: 5000, category: 'Tuition', description: 'Student Fees - Grade 10', date: new Date().toISOString(), status: 'completed' },
            { type: 'expense', amount: 1200, category: 'Maintenance', description: 'AC Repair', date: new Date().toISOString(), status: 'pending' },
        ];

        for (const t of transactions) {
            await pb.collection('finance_transactions').create(t);
        }

        // 5. Create Activities
        console.log('Seeding Activities...');
        const activities = [
            { title: 'Community Garden Planting', category: 'Local', date: new Date().toISOString(), location: 'Central Park', description: 'Join us for planting.', organizer: 'Green Earth' },
            { title: 'Jazz Night', category: 'Social', date: new Date().toISOString(), location: 'Blue Note', description: 'Live Jazz music.', organizer: 'Blue Note' },
        ];

        for (const a of activities) {
            try {
                await pb.collection('activities').create(a);
            } catch (e) {
                console.log(`Activity ${a.title} might already exist.`);
            }
        }

        console.log('Seeding complete!');

    } catch (err) {
        console.error('Error seeding data:', err.originalError || err.message);
    }
}

main();
