const { Client } = require('pg');

const client = new Client({
    host: 'dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com',
    port: 5432,
    database: 'civicpath_db',
    user: 'civicpath_db_user',
    password: 'pret9eicHI9KtRKzBEGpt1sLSV74buRH',
    ssl: { rejectUnauthorized: false }
});

async function checkLatest() {
    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Get the latest complaint
        const result = await client.query(`
            SELECT 
                c.id,
                c.complaint_number,
                c.citizen_name,
                c.citizen_mobile,
                c.title,
                c.description,
                c.created_at
            FROM complaints c
            ORDER BY c.created_at DESC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            console.log('❌ No complaints found');
            return;
        }

        const complaint = result.rows[0];
        console.log('📋 Latest Complaint:');
        console.log(`   ID: ${complaint.id}`);
        console.log(`   Number: ${complaint.complaint_number}`);
        console.log(`   Citizen: ${complaint.citizen_name}`);
        console.log(`   Mobile: ${complaint.citizen_mobile}`);
        console.log(`   Title: ${complaint.title}`);
        console.log(`   Description: ${complaint.description}`);
        console.log(`   Created: ${complaint.created_at}\n`);

        // Check for attachments
        const attachments = await client.query(`
            SELECT 
                id,
                file_url,
                file_name,
                file_type,
                mime_type,
                file_size_kb,
                uploaded_at
            FROM complaint_attachments
            WHERE complaint_id = $1
        `, [complaint.id]);

        if (attachments.rows.length > 0) {
            console.log(`✅ Found ${attachments.rows.length} attachment(s):\n`);
            attachments.rows.forEach((att, index) => {
                console.log(`   Attachment ${index + 1}:`);
                console.log(`   - File: ${att.file_name}`);
                console.log(`   - Type: ${att.file_type}`);
                console.log(`   - MIME: ${att.mime_type}`);
                console.log(`   - Size: ${att.file_size_kb} KB`);
                console.log(`   - URL: ${att.file_url}`);
                console.log(`   - Uploaded: ${att.uploaded_at}\n`);
            });
        } else {
            console.log('❌ No attachments found for this complaint\n');
        }

        // Check all recent complaints with their attachment counts
        console.log('📊 Recent complaints with attachment status:\n');
        const allRecent = await client.query(`
            SELECT 
                c.complaint_number,
                c.citizen_name,
                COUNT(ca.id) as attachment_count,
                c.created_at
            FROM complaints c
            LEFT JOIN complaint_attachments ca ON c.id = ca.complaint_id
            GROUP BY c.id, c.complaint_number, c.citizen_name, c.created_at
            ORDER BY c.created_at DESC
            LIMIT 10
        `);

        allRecent.rows.forEach(row => {
            const status = row.attachment_count > 0 ? '✅' : '❌';
            console.log(`   ${status} ${row.complaint_number} - ${row.citizen_name} (${row.attachment_count} photo(s))`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkLatest();
