import PocketBase from 'pocketbase';

const client = new PocketBase('http://127.0.0.1:8090');

async function diagnose() {
    try {
        await client.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log("Authenticated as admin.");

        // 1. Test Sort by ID
        console.log("\n--- Testing Sort by ID ---");
        try {
            const result = await client.collection('tenants').getList(1, 1, {
                sort: '-id'
            });
            console.log("Success! Total items:", result.totalItems);
        } catch (e) {
            console.error("FAILED ID:", e.message);
        }

        // 2. Test Sort by Updated
        console.log("\n--- Testing Sort by Updated ---");
        try {
            const result = await client.collection('tenants').getList(1, 1, {
                sort: '-updated'
            });
            console.log("Success! Total items:", result.totalItems);
        } catch (e) {
            console.error("FAILED Updated:", e.message);
        }

        // 3. Test Filter by Updated
        console.log("\n--- Testing Filter by Updated ---");
        try {
            const result = await client.collection('tenants').getList(1, 1, {
                filter: 'updated > "2020-01-01"'
            });
            console.log("Success! Total items:", result.totalItems);
        } catch (e) {
            console.error("FAILED Filter Updated:", e.message);
        }

    } catch (err) {
        console.error("Global Error:", err);
    }
}

diagnose();
