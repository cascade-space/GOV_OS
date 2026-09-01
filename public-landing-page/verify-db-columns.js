const { Client } = require('pg');

const client = new Client({
    host: 'dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com',
    port: 5432,
    database: 'civicpath_db',
    user: 'civicpath_db_user',
    password: 'pret9eicHI9KtRKzBEGpt1sLSV74buRH',
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    try {
        await client.connect();
        console.log('Connected!\n');

        // Check all columns in complaints table
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'complaints'
            ORDER BY ordinal_position;
        `);

        console.log('Columns in complaints table:');
        console.log('================================');
        result.rows.forEach(row => {
            console.log(`${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
        });

        // Check if created_at exists
        const hasCreatedAt = result.rows.some(r => r.column_name === 'created_at');
        const hasUpdatedAt = result.rows.some(r => r.column_name === 'updated_at');

        console.log('\n================================');
        console.log(`created_at exists: ${hasCreatedAt ? '✅ YES' : '❌ NO'}`);
        console.log(`updated_at exists: ${hasUpdatedAt ? '✅ YES' : '❌ NO'}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

verify();
