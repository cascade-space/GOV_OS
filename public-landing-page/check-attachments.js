// Check if attachments were saved
const { Client } = require('pg');

const connectionString = 'postgresql://civicpath_db_user:pret9eicHI9KtRKzBEGpt1sLSV74buRH@dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com/civicpath_db';

async function checkAttachments() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Check attachments
        const result = await client.query(`
            SELECT ca.*, c.complaint_number, c.title 
            FROM complaint_attachments ca
            JOIN complaints c ON ca.complaint_id = c.id
            ORDER BY ca.uploaded_at DESC
            LIMIT 10
        `);
        
        console.log(`📎 Total attachments found: ${result.rows.length}\n`);
        
        if (result.rows.length > 0) {
            console.log('Recent attachments:');
            result.rows.forEach((att, index) => {
                console.log(`\n${index + 1}. Complaint: ${att.complaint_number}`);
                console.log(`   File: ${att.file_name}`);
                console.log(`   URL: ${att.file_url}`);
                console.log(`   Uploaded by: ${att.uploaded_by_name || 'N/A'} (${att.uploaded_by_mobile || 'N/A'})`);
                console.log(`   Size: ${att.file_size_kb} KB`);
                console.log(`   Type: ${att.file_type}`);
            });
        } else {
            console.log('❌ No attachments found');
            console.log('Images might not be uploading or Cloudinary is not configured.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkAttachments();
