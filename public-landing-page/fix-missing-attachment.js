const { Client } = require('pg');

const client = new Client({
    host: 'dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com',
    port: 5432,
    database: 'civicpath_db',
    user: 'civicpath_db_user',
    password: 'pret9eicHI9KtRKzBEGpt1sLSV74buRH',
    ssl: { rejectUnauthorized: false }
});

async function fixAttachment() {
    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Get complaint CMP-2026-00021
        const complaint = await client.query(
            'SELECT id, complaint_number, citizen_name FROM complaints WHERE complaint_number = $1',
            ['CMP-2026-00021']
        );

        if (complaint.rows.length === 0) {
            console.log('❌ Complaint CMP-2026-00021 not found');
            return;
        }

        const complaintData = complaint.rows[0];
        console.log(`📋 Found complaint: ${complaintData.complaint_number} - ${complaintData.citizen_name}`);
        console.log(`   ID: ${complaintData.id}\n`);

        // Check if attachment already exists
        const existing = await client.query(
            'SELECT id FROM complaint_attachments WHERE complaint_id = $1',
            [complaintData.id]
        );

        if (existing.rows.length > 0) {
            console.log('✅ Attachment already exists');
            return;
        }

        // Add the attachment
        const imageUrl = 'https://res.cloudinary.com/dredol55o/image/upload/v1772736609/civicpath-complaints/38d5745a-935e-4957-b327-3286cce9a480_CMP-2026-00021.jpg';
        
        await client.query(`
            INSERT INTO complaint_attachments 
            (complaint_id, file_url, file_name, file_type, mime_type, file_size_kb, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [
            complaintData.id,
            imageUrl,
            '38d5745a-935e-4957-b327-3286cce9a480_CMP-2026-00021.jpg',
            'photo',
            'image/jpeg',
            41
        ]);

        console.log('✅ Successfully added attachment to complaint CMP-2026-00021\n');

        // Verify
        const verify = await client.query(
            'SELECT file_url, file_name FROM complaint_attachments WHERE complaint_id = $1',
            [complaintData.id]
        );

        console.log('📷 Attachment details:');
        console.log(`   File: ${verify.rows[0].file_name}`);
        console.log(`   URL: ${verify.rows[0].file_url}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

fixAttachment();
