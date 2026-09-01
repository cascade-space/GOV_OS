const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dredol55o',
    api_key: '442391251121382',
    api_secret: 'DzIRRoSb3yDkxbqX1nmnI9OKqWE'
});

async function checkLatestImages() {
    try {
        console.log('☁️  Checking Cloudinary for latest images...\n');
        
        // Get all images sorted by upload date
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'civicpath-complaints',
            max_results: 30,
            resource_type: 'image'
        });

        console.log(`Found ${result.resources.length} total images\n`);
        
        // Sort by created_at descending
        const sorted = result.resources.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );

        console.log('📷 Latest 10 images:\n');
        sorted.slice(0, 10).forEach((resource, index) => {
            const filename = resource.public_id.split('/').pop();
            const uploadDate = new Date(resource.created_at);
            console.log(`${index + 1}. ${filename}`);
            console.log(`   Uploaded: ${uploadDate.toLocaleString()}`);
            console.log(`   URL: ${resource.secure_url}`);
            console.log(`   Size: ${Math.round(resource.bytes / 1024)} KB\n`);
        });

        // Check for CMP-2026-00021 specifically
        console.log('🔍 Looking for CMP-2026-00021...\n');
        const cmp21 = sorted.find(r => r.public_id.includes('CMP-2026-00021'));
        if (cmp21) {
            console.log('✅ Found image for CMP-2026-00021:');
            console.log(`   ${cmp21.public_id}`);
            console.log(`   ${cmp21.secure_url}`);
        } else {
            console.log('❌ No image found for CMP-2026-00021');
            console.log('   This means the photo was not uploaded to Cloudinary');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.error) {
            console.error('   Details:', error.error);
        }
    }
}

checkLatestImages();
