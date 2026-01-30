// Test CRUD operations with Redis caching
const BASE_URL = 'http://localhost:3000';

async function test() {
    console.log('🧪 Testing CRUD + Redis Caching\n');

    // 1. Create an item
    console.log('1️⃣  Creating item...');
    const createRes = await fetch(`${BASE_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Item', description: 'This is a test' })
    });
    const created = await createRes.json();
    console.log('   Created:', created);

    // 2. Get all items (Cache MISS expected)
    console.log('\n2️⃣  Getting all items (1st call - Cache MISS expected)...');
    const getAll1 = await fetch(`${BASE_URL}/api/items`);
    const items1 = await getAll1.json();
    console.log('   Items:', items1);

    // 3. Get all items again (Cache HIT expected)
    console.log('\n3️⃣  Getting all items (2nd call - Cache HIT expected)...');
    const getAll2 = await fetch(`${BASE_URL}/api/items`);
    const items2 = await getAll2.json();
    console.log('   Items:', items2);

    // 4. Get single item (Cache MISS expected)
    console.log(`\n4️⃣  Getting item ${created.id} (1st call - Cache MISS expected)...`);
    const getOne1 = await fetch(`${BASE_URL}/api/items/${created.id}`);
    const item1 = await getOne1.json();
    console.log('   Item:', item1);

    // 5. Get single item again (Cache HIT expected)
    console.log(`\n5️⃣  Getting item ${created.id} (2nd call - Cache HIT expected)...`);
    const getOne2 = await fetch(`${BASE_URL}/api/items/${created.id}`);
    const item2 = await getOne2.json();
    console.log('   Item:', item2);

    console.log('\n✅ Test complete! Check server logs for "Cache Hit" and "Cache Miss" messages.');
}

test().catch(console.error);
