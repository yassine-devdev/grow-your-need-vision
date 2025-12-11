import PocketBase from 'pocketbase';

const client = new PocketBase('http://127.0.0.1:8090');

async function testCustomDate() {
    try {
        await client.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log("Authenticated as admin.");

        console.log("Testing filter by paid_at (custom date)...");
        try {
            // Just try to list with filter, even if empty
            const result = await client.collection('invoices').getList(1, 1, {
                filter: 'paid_at > "2020-01-01"'
            });
            console.log("Success! Total items:", result.totalItems);
        } catch (e) {
            console.error("FAILED paid_at:", e.message);
        }

    } catch (err) {
        console.error("Global Error:", err);
    }
}

testCustomDate();
