const { Client } = require('pg');

const client = new Client({
    host: 'dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com',
    port: 5432,
    database: 'civicpath_db',
    user: 'civicpath_db_user',
    password: 'pret9eicHI9KtRKzBEGpt1sLSV74buRH',
    ssl: { rejectUnauthorized: false }
});

async function fix() {
    try {
        console.log('Connecting...');
        await client.connect();
        console.log('Connected!');

        await client.query('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('Added created_at');

        await client.query('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('Added updated_at');

        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

fix();
