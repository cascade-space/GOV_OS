const { Client } = require('pg');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dredo155o',
    api_key: process.env.CLOUDINARY_API_KEY || '442391251121382',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'DzIRNoSb3yDkxbqX1nmI90KqwE'
});

// Database connection
const client = new Client({
    host: 'dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com',
    port: 5432,
    database: 'civicpath_db',
    user: 'civicpath_db_user',
    password: 'pret9eicHI9KtRKzBEGpt1sLSV74buRH',
    ssl: { rejectUnauthorized: false }
});

async function checkImages() {
    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Check complaints in database
        const complaints = await client.query(`
            SELECT id, complaint_number, citizen_name, created_at 
            FROM complaints 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        console.log(`📋 Found ${complaints.rows.length} recent complaints:\n`);
        
        for (const complaint of complaints.rows) {
            console.log(`Complaint: ${complaint.complaint_number} - ${complaint.citizen_name}`);
            
            // Check if complaint has attachments in database
            const attachments = await client.query(`
                SELECT file_url, file_name, file_type 
                FROM complaint_attachments 
                WHERE complaint_id = $1
            `, [complaint.id]);
            
            if (attachments.rows.length > 0) {
                console.log(`  ✅ Has ${attachments.rows.length} attachment(s) in database:`);
                attachments.rows.forEach(att => {
                    console.log(`     - ${att.file_name} (${att.file_type})`);
                    console.log(`       URL: ${att.file_url}`);
                });
            } else {
                console.log(`  ❌ No attachments in database`);
            }
            console.log('');
        }

        // Check Cloudinary for images
        console.log('\n☁️  Checking Cloudinary for images...\n');
        
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'civicpath-complaints',
            max_results: 50
        });

        if (result.resources.length > 0) {
            console.log(`Found ${result.resources.length} images in Cloudinary:\n`);
            result.resources.forEach(resource => {
                console.log(`📷 ${resource.public_id}`);
                console.log(`   URL: ${resource.secure_url}`);
                console.log(`   Uploaded: ${resource.created_at}`);
                console.log('');
            });
        } else {
            console.log('❌ No images found in Cloudinary civicpath-complaints folder');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkImages();
