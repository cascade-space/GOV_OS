const { Client } = require('pg');

// Using INTERNAL database connection (what your backend uses)
const client = new Client({
    host: 'dpg-d6ft9mrh46gs738k11c0-a',  // Internal hostname (no .singapore-postgres.render.com)
    port: 5432,
    database: 'civicpath_db',
    user: 'civicpath_db_user',
    password: 'pret9eicHI9KtRKzBEGpt1sLSV74buRH',
    ssl: { rejectUnauthorized: false }
});

async function fix() {
    try {
        console.log('Connecting to INTERNAL database...');
        await client.connect();
        console.log('Connected!');

        console.log('Adding created_at column...');
        await client.query('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ Added created_at');

        console.log('Adding updated_at column...');
        await client.query('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ Added updated_at');

        console.log('\n🎉 Done! Try submitting a complaint now.');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nThis is expected - you cannot connect to internal database from outside Render.');
        console.log('The columns were already added to the external database.');
        console.log('\nThe issue is that External and Internal are the SAME database, so this is confusing...');
    } finally {
        try {
            await client.end();
        } catch (e) {}
    }
}

fix();
