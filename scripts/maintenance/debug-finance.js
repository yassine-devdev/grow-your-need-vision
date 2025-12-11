import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function debugFinance() {
    try {
        await pb.admins.authWithPassword('owner@growyourneed.com', 'Darnag123456789@');
        const finance = await pb.collections.getOne('finance_transactions');
        console.log('Type:', finance.type);
        console.log('Keys:', Object.keys(finance));
        console.log('Fields:', finance.fields);
    } catch (e) {
        console.error(e);
    }
}

debugFinance();
