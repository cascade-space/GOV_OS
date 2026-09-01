// Check specific complaint location data
const { Client } = require('pg');

const connectionString = 'postgresql://civicpath_db_user:pret9eicHI9KtRKzBEGpt1sLSV74buRH@dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com/civicpath_db';

async function checkComplaint() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Get the most recent complaint
        const result = await client.query(`
            SELECT 
                complaint_number,
                title,
                location_address,
                latitude,
                longitude,
                ward,
                citizen_name,
                citizen_mobile
            FROM complaints 
            ORDER BY created_at DESC 
            LIMIT 3
        `);
        
        console.log('📍 Recent complaint locations:\n');
        
        result.rows.forEach((complaint, index) => {
            console.log(`${index + 1}. ${complaint.complaint_number}`);
            console.log(`   Title: ${complaint.title}`);
            console.log(`   Address: ${complaint.location_address}`);
            console.log(`   Coordinates: ${complaint.latitude}, ${complaint.longitude}`);
            console.log(`   Ward: ${complaint.ward}`);
            console.log(`   Citizen: ${complaint.citizen_name} (${complaint.citizen_mobile})`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkComplaint();
