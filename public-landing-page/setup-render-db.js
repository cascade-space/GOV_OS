// Setup Render Database - Run this to create all tables
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Render database connection
const connectionString = 'postgresql://civicpath_db_user:pret9eicHI9KtRKzBEGpt1sLSV74buRH@dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com/civicpath_db';

async function setupDatabase() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔌 Connecting to Render database...');
        await client.connect();
        console.log('✅ Connected successfully!\n');

        // Read schema file
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📋 Executing schema.sql...');
        await client.query(schema);
        console.log('✅ Database schema created successfully!\n');

        // Check if tables were created
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        console.log('📊 Tables created:');
        result.rows.forEach(row => {
            console.log('  ✓', row.table_name);
        });

        console.log('\n🎉 Database setup complete!');
        console.log('Your backend is now ready to accept complaints.');

    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        if (error.detail) console.error('Detail:', error.detail);
    } finally {
        await client.end();
    }
}

setupDatabase();
