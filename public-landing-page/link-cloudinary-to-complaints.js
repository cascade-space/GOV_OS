const { Client } = require('pg');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dredol55o',
    api_key: process.env.CLOUDINARY_API_KEY || '442391251121382',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'DzIRRoSb3yDkxbqX1nmnI9OKqWE'
});

// Database connection to Render
const client = new Client({
    host: 'dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com',
    port: 5432,
    database: 'civicpath_db',
    user: 'civicpath_db_user',
    password: 'pret9eicHI9KtRKzBEGpt1sLSV74buRH',
    ssl: { rejectUnauthorized: false }
});

async function linkImages() {
    try {
        await client.connect();
        console.log('✅ Connected to Render database\n');

        // Fetch all images from Cloudinary
        console.log('☁️  Fetching images from Cloudinary...\n');
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'civicpath-complaints',
            max_results: 100
        });

        console.log(`Found ${result.resources.length} images in Cloudinary\n`);

        let linkedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const resource of result.resources) {
            try {
                // Extract public_id (e.g., "civicpath-complaints/uuid_CMP-2026-00001")
                const publicId = resource.public_id;
                const filename = publicId.split('/').pop(); // Get "uuid_CMP-2026-00001"
                
                console.log(`\n📷 Processing: ${filename}`);
                
                // Try to extract complaint number from filename
                // Format could be: uuid_CMP-2026-00001 or temp_uuid or just CMP-2026-00001
                let complaintNumber = null;
                
                if (filename.includes('CMP-')) {
                    // Extract CMP-2026-XXXXX pattern
                    const match = filename.match(/(CMP-\d{4}-\d{5})/);
                    if (match) {
                        complaintNumber = match[1];
                    }
                } else if (filename.startsWith('temp_')) {
                    console.log(`  ⚠️  Skipping temp file: ${filename}`);
                    skippedCount++;
                    continue;
                }

                if (!complaintNumber) {
                    console.log(`  ⚠️  Could not extract complaint number from: ${filename}`);
                    skippedCount++;
                    continue;
                }

                console.log(`  🔍 Looking for complaint: ${complaintNumber}`);

                // Find complaint in database
                const complaintResult = await client.query(
                    'SELECT id, complaint_number FROM complaints WHERE complaint_number = $1',
                    [complaintNumber]
                );

                if (complaintResult.rows.length === 0) {
                    console.log(`  ❌ Complaint not found in database: ${complaintNumber}`);
                    errorCount++;
                    continue;
                }

                const complaint = complaintResult.rows[0];
                console.log(`  ✅ Found complaint ID: ${complaint.id}`);

                // Check if attachment already exists
                const existingAttachment = await client.query(
                    'SELECT id FROM complaint_attachments WHERE complaint_id = $1 AND file_url = $2',
                    [complaint.id, resource.secure_url]
                );

                if (existingAttachment.rows.length > 0) {
                    console.log(`  ℹ️  Attachment already linked`);
                    skippedCount++;
                    continue;
                }

                // Determine file type and mime type
                const format = resource.format || 'jpg';
                const mimeType = format === 'pdf' ? 'application/pdf' : `image/${format}`;
                const fileType = format === 'pdf' ? 'document' : 'photo';

                // Calculate file size in KB
                const fileSizeKb = resource.bytes ? Math.round(resource.bytes / 1024) : null;

                // Insert into complaint_attachments table
                await client.query(`
                    INSERT INTO complaint_attachments 
                    (complaint_id, file_url, file_name, file_type, mime_type, file_size_kb, uploaded_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    complaint.id,
                    resource.secure_url,
                    `${filename}.${format}`,
                    fileType,
                    mimeType,
                    fileSizeKb,
                    new Date(resource.created_at)
                ]);

                console.log(`  ✅ Linked attachment to complaint ${complaintNumber}`);
                linkedCount++;

            } catch (error) {
                console.error(`  ❌ Error processing ${resource.public_id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY:');
        console.log('='.repeat(60));
        console.log(`✅ Successfully linked: ${linkedCount} images`);
        console.log(`⚠️  Skipped: ${skippedCount} images`);
        console.log(`❌ Errors: ${errorCount} images`);
        console.log('='.repeat(60));

        // Show updated complaints with attachments
        console.log('\n📋 Complaints with attachments:\n');
        const complaintsWithAttachments = await client.query(`
            SELECT 
                c.complaint_number,
                c.citizen_name,
                COUNT(ca.id) as attachment_count
            FROM complaints c
            LEFT JOIN complaint_attachments ca ON c.id = ca.complaint_id
            WHERE ca.id IS NOT NULL
            GROUP BY c.id, c.complaint_number, c.citizen_name
            ORDER BY c.created_at DESC
        `);

        complaintsWithAttachments.rows.forEach(row => {
            console.log(`  ${row.complaint_number} - ${row.citizen_name} (${row.attachment_count} photo(s))`);
        });

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        console.error(error);
    } finally {
        await client.end();
        console.log('\n✅ Database connection closed');
    }
}

// Run the migration
console.log('🚀 Starting Cloudinary to Database Migration...\n');
linkImages();
