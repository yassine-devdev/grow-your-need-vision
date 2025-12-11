import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function initFinanceSchema() {
    try {
        const adminAuth = await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        console.log('Authenticated as admin');

        // 1. Transactions
        try {
            await pb.collections.create({
                name: 'transactions',
                type: 'base',
                schema: [
                    { name: 'date', type: 'date', required: true },
                    { name: 'description', type: 'text', required: true },
                    { name: 'amount', type: 'number', required: true },
                    { name: 'type', type: 'select', required: true, options: { values: ['income', 'expense'] } },
                    { name: 'status', type: 'select', required: true, options: { values: ['Completed', 'Pending', 'Failed'] } },
                    { name: 'category', type: 'text', required: true },
                    { name: 'reference_id', type: 'text', required: false }
                ],
                listRule: '',
                viewRule: '',
                createRule: '@request.auth.id != ""',
                updateRule: '@request.auth.id != ""',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('Created transactions collection');
        } catch (e) {
            console.log('transactions collection might already exist');
        }

    } catch (error) {
        console.error('Failed to init finance schema:', error);
    }
}

initFinanceSchema();
