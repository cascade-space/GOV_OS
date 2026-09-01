const { Client } = require('pg');

// Connection configuration
const client = new Client({
    host: 'dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com',
    port: 5432,
    database: 'civicpath_db',
    user: 'civicpath_db_user',
    password: 'pret9eicHI9KtRKzBEGpt1sLSV74buRH',
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixDatabase() {
    try {
        console.log('🔌 Connecting to Render database...');
        await client.connect();
        console.log('✅ Connected successfully!');

        // Add created_at column
        console.log('\n📝 Adding created_at column...');
        await client.query(`
            ALTER TABLE complaints 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);
        console.log('✅ created_at column added');

        // Add updated_at column
        console.log('\n📝 Adding updated_at column...');
        await client.query(`
            ALTER TABLE complaints 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);
        console.log('✅ updated_at column added');

        // Update existing rows
        console.log('\n📝 Updating existing rows...');
        await client.query(`
            UPDATE complaints 
            SET created_at = CURRENT_TIMESTAMP 
            WHERE created_at IS NULL;
        `);
        await client.query(`
            UPDATE complaints 
            SET updated_at = CURRENT_TIMESTAMP 
            WHERE updated_at IS NULL;
        `);
        console.log('✅ Existing rows updated');

        // Verify the fix
        console.log('\n🔍 Verifying columns...');
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'complaints' 
            AND column_name IN ('created_at', 'updated_at');
        `);
        
        console.log('\n✅ Database fixed successfully!');
        console.log('Columns found:', result.rows);
        
        console.log('\n🎉 You can now submit complaints on your website!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nFull error:', error);
    } finally {
        await client.end();
        console.log('\n🔌 Disconnected from database');
    }
}

fixDatabase();
