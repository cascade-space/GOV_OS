const { Client } = require('pg');

const client = new Client({
    host: 'dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com',
    port: 5432,
    database: 'civicpath_db',
    user: 'civicpath_db_user',
    password: 'pret9eicHI9KtRKzBEGpt1sLSV74buRH',
    ssl: { rejectUnauthorized: false }
});

async function checkTable() {
    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Check table structure
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'complaint_attachments'
            ORDER BY ordinal_position
        `);

        console.log('📋 complaint_attachments table structure:\n');
        result.rows.forEach(col => {
            console.log(`  ${col.column_name} - ${col.data_type} (nullable: ${col.is_nullable})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkTable();
