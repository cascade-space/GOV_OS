// Check if complaints were saved to database
const { Client } = require('pg');

const connectionString = 'postgresql://civicpath_db_user:pret9eicHI9KtRKzBEGpt1sLSV74buRH@dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com/civicpath_db';

async function checkComplaints() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Check if any complaints exist
        const result = await client.query('SELECT * FROM complaints ORDER BY created_at DESC LIMIT 5');
        
        console.log(`📊 Total complaints found: ${result.rows.length}\n`);
        
        if (result.rows.length > 0) {
            console.log('Recent complaints:');
            result.rows.forEach((complaint, index) => {
                console.log(`\n${index + 1}. ${complaint.complaint_number}`);
                console.log(`   Title: ${complaint.title}`);
                console.log(`   Citizen: ${complaint.citizen_name} (${complaint.citizen_mobile})`);
                console.log(`   Status: ${complaint.status}`);
                console.log(`   Created: ${complaint.created_at}`);
            });
        } else {
            console.log('❌ No complaints found in database');
            console.log('The submission might have failed or data is not being saved.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkComplaints();
