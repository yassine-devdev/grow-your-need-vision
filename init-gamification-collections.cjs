/**
 * Initialize Gamification Collections
 * Creates: universes, timelines, missions, glitches, user_progress, user_mission_completions, user_glitch_fixes
 */

const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8090');

const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'owner@growyourneed.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'Darnag123456789@';

async function createGamificationCollections() {
    try {
        console.log('🔐 Authenticating...');
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ Authenticated\n');

        // Get users collection ID
        const usersCollection = await pb.collections.getOne('users');
        const usersId = usersCollection.id;

        const collections = [
            // 1. Universes
            {
                name: 'universes',
                type: 'base',
                schema: [
                    { name: 'name', type: 'text', required: true, options: { min: 1, max: 100 } },
                    { name: 'description', type: 'text', required: true, options: { max: 500 } },
                    { name: 'type', type: 'select', required: true, options: { maxSelect: 1, values: ['SchoolClass', 'SoloTrack'] } },
                    { name: 'subject', type: 'text', required: true, options: { max: 50 } },
                    { name: 'icon', type: 'text', required: true, options: { max: 50 } }, // Emoji or icon name
                    { name: 'min_level', type: 'number', required: true, options: { min: 1 } },
                    { name: 'is_active', type: 'bool', required: true },
                    { name: 'cover_image', type: 'file', required: false, options: { maxSelect: 1, maxSize: 5242880 } }
                ],
                listRule: '', // Public read
                viewRule: '', // Public read
                createRule: '@request.auth.role = "Owner" || @request.auth.role = "Admin"',
                updateRule: '@request.auth.role = "Owner" || @request.auth.role = "Admin"',
                deleteRule: '@request.auth.role = "Owner"'
            },
            // 2. Timelines
            {
                name: 'timelines',
                type: 'base',
                schema: [
                    // We'll add the relation later to avoid circular dependency issues during creation if order matters, 
                    // but here we can define it if 'universes' exists. Since we create in order, it's fine.
                    // However, to be safe, we'll assume 'universes' is created first.
                    { name: 'name', type: 'text', required: true, options: { min: 1, max: 100 } },
                    { name: 'difficulty', type: 'select', required: true, options: { maxSelect: 1, values: ['Easy', 'Medium', 'Hard', 'Nightmare'] } },
                    { name: 'color', type: 'text', required: true, options: { pattern: '^#[0-9a-fA-F]{6}$' } },
                    { name: 'order', type: 'number', required: true, options: { min: 0 } },
                    { name: 'description', type: 'text', required: false, options: { max: 500 } }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.role = "Owner" || @request.auth.role = "Admin"',
                updateRule: '@request.auth.role = "Owner" || @request.auth.role = "Admin"',
                deleteRule: '@request.auth.role = "Owner"'
            },
            // 3. Missions
            {
                name: 'missions',
                type: 'base',
                schema: [
                    { name: 'title', type: 'text', required: true, options: { min: 1, max: 100 } },
                    { name: 'description', type: 'text', required: true, options: { max: 1000 } },
                    { name: 'xp_reward', type: 'number', required: true, options: { min: 0 } },
                    { name: 'type', type: 'select', required: true, options: { maxSelect: 1, values: ['Quiz', 'Coding', 'Project', 'Video', 'ParallelClass'] } },
                    { name: 'content', type: 'json', required: false },
                    { name: 'is_boss', type: 'bool', required: false }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.role = "Owner" || @request.auth.role = "Admin" || @request.auth.role = "Teacher"',
                updateRule: '@request.auth.role = "Owner" || @request.auth.role = "Admin" || @request.auth.role = "Teacher"',
                deleteRule: '@request.auth.role = "Owner" || @request.auth.role = "Admin"'
            },
            // 4. Glitches
            {
                name: 'glitches',
                type: 'base',
                schema: [
                    { name: 'title', type: 'text', required: true, options: { min: 1, max: 100 } },
                    { name: 'description', type: 'text', required: true, options: { max: 500 } },
                    { name: 'broken_content', type: 'text', required: true, options: { max: 1000 } },
                    { name: 'correct_content', type: 'text', required: true, options: { max: 1000 } },
                    { name: 'difficulty', type: 'number', required: true, options: { min: 1, max: 5 } },
                    { name: 'xp_reward', type: 'number', required: true, options: { min: 0 } },
                    { name: 'is_active', type: 'bool', required: true }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.role = "Owner" || @request.auth.role = "Admin"',
                updateRule: '@request.auth.role = "Owner" || @request.auth.role = "Admin"',
                deleteRule: '@request.auth.role = "Owner"'
            },
            // 5. User Progress
            {
                name: 'user_progress',
                type: 'base',
                schema: [
                    { name: 'user', type: 'relation', required: true, options: { collectionId: usersId, cascadeDelete: true, maxSelect: 1 } },
                    { name: 'current_xp', type: 'number', required: true, options: { min: 0 } },
                    { name: 'level', type: 'number', required: true, options: { min: 1 } },
                    { name: 'streak_days', type: 'number', required: true, options: { min: 0 } },
                    { name: 'last_active', type: 'date', required: false }
                ],
                listRule: '@request.auth.id = user.id || @request.auth.role = "Owner"',
                viewRule: '@request.auth.id = user.id || @request.auth.role = "Owner"',
                createRule: '@request.auth.id != ""', // Auto-created on first login usually
                updateRule: '@request.auth.id = user.id || @request.auth.role = "Owner"',
                deleteRule: '@request.auth.role = "Owner"'
            },
            // 6. User Mission Completions (Join Table)
            {
                name: 'user_mission_completions',
                type: 'base',
                schema: [
                    { name: 'user', type: 'relation', required: true, options: { collectionId: usersId, cascadeDelete: true, maxSelect: 1 } },
                    { name: 'completed_at', type: 'date', required: true },
                    { name: 'score', type: 'number', required: false },
                    { name: 'submission_url', type: 'url', required: false }
                ],
                listRule: '@request.auth.id = user.id || @request.auth.role = "Owner" || @request.auth.role = "Teacher"',
                viewRule: '@request.auth.id = user.id || @request.auth.role = "Owner" || @request.auth.role = "Teacher"',
                createRule: '@request.auth.id = user.id',
                updateRule: '@request.auth.role = "Owner"',
                deleteRule: '@request.auth.role = "Owner"'
            },
            // 7. User Glitch Fixes (Join Table)
            {
                name: 'user_glitch_fixes',
                type: 'base',
                schema: [
                    { name: 'user', type: 'relation', required: true, options: { collectionId: usersId, cascadeDelete: true, maxSelect: 1 } },
                    { name: 'fixed_at', type: 'date', required: true },
                    { name: 'attempts', type: 'number', required: true, options: { min: 1 } }
                ],
                listRule: '@request.auth.id = user.id || @request.auth.role = "Owner"',
                viewRule: '@request.auth.id = user.id || @request.auth.role = "Owner"',
                createRule: '@request.auth.id = user.id',
                updateRule: '@request.auth.role = "Owner"',
                deleteRule: '@request.auth.role = "Owner"'
            }
        ];

        // Create base collections first
        for (const collectionDef of collections) {
            try {
                console.log(`📦 Creating: ${collectionDef.name}`);
                try {
                    await pb.collections.getOne(collectionDef.name);
                    console.log(`   ⚠️  Already exists, skipping creation\n`);
                } catch (err) {
                    await pb.collections.create(collectionDef);
                    console.log(`   ✅ Created\n`);
                }
            } catch (error) {
                console.error(`   ❌ Error creating ${collectionDef.name}: ${error.message}\n`);
            }
        }

        // Now add relations (fields that reference other collections we just created)
        console.log('🔗 Adding relations...');

        // Get IDs of newly created collections
        const universes = await pb.collections.getOne('universes');
        const timelines = await pb.collections.getOne('timelines');
        const missions = await pb.collections.getOne('missions');
        const glitches = await pb.collections.getOne('glitches');

        // Update Timelines -> Universe
        try {
            await pb.collections.update(timelines.id, {
                schema: [
                    ...timelines.schema,
                    { name: 'universe', type: 'relation', required: true, options: { collectionId: universes.id, cascadeDelete: true, maxSelect: 1 } }
                ]
            });
            console.log('   ✅ Linked Timelines -> Universe');
        } catch (e) { console.log('   ⚠️  Timeline relation might already exist'); }

        // Update Missions -> Timeline
        try {
            await pb.collections.update(missions.id, {
                schema: [
                    ...missions.schema,
                    { name: 'timeline', type: 'relation', required: true, options: { collectionId: timelines.id, cascadeDelete: true, maxSelect: 1 } },
                    { name: 'required_mission', type: 'relation', required: false, options: { collectionId: missions.id, cascadeDelete: false, maxSelect: 1 } }
                ]
            });
            console.log('   ✅ Linked Missions -> Timeline');
        } catch (e) { console.log('   ⚠️  Mission relation might already exist'); }

        // Update Glitches -> Universe
        try {
            await pb.collections.update(glitches.id, {
                schema: [
                    ...glitches.schema,
                    { name: 'universe', type: 'relation', required: true, options: { collectionId: universes.id, cascadeDelete: true, maxSelect: 1 } }
                ]
            });
            console.log('   ✅ Linked Glitches -> Universe');
        } catch (e) { console.log('   ⚠️  Glitch relation might already exist'); }

        // Update User Mission Completions -> Mission
        try {
            const umc = await pb.collections.getOne('user_mission_completions');
            await pb.collections.update(umc.id, {
                schema: [
                    ...umc.schema,
                    { name: 'mission', type: 'relation', required: true, options: { collectionId: missions.id, cascadeDelete: true, maxSelect: 1 } }
                ]
            });
            console.log('   ✅ Linked User Mission Completions -> Mission');
        } catch (e) { console.log('   ⚠️  UMC relation might already exist'); }

        // Update User Glitch Fixes -> Glitch
        try {
            const ugf = await pb.collections.getOne('user_glitch_fixes');
            await pb.collections.update(ugf.id, {
                schema: [
                    ...ugf.schema,
                    { name: 'glitch', type: 'relation', required: true, options: { collectionId: glitches.id, cascadeDelete: true, maxSelect: 1 } }
                ]
            });
            console.log('   ✅ Linked User Glitch Fixes -> Glitch');
        } catch (e) { console.log('   ⚠️  UGF relation might already exist'); }

        console.log('🎉 Gamification Collections Initialized!');

    } catch (error) {
        console.error('❌ Fatal:', error.message);
        process.exit(1);
    }
}

createGamificationCollections();
