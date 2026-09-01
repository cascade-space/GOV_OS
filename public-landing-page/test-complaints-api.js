const https = require('https');

const options = {
    hostname: 'civicpath.onrender.com',
    path: '/api/v1/complaints?page=1&limit=10',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log('🔍 Testing complaints API...\n');
console.log(`URL: https://${options.hostname}${options.path}\n`);

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (response.success) {
                console.log('✅ API Response successful\n');
                console.log(`Total complaints: ${response.data.pagination.total}`);
                console.log(`Returned: ${response.data.complaints.length} complaints\n`);
                
                // Check first 5 complaints for attachments
                console.log('📋 Checking attachments:\n');
                response.data.complaints.slice(0, 5).forEach((complaint, index) => {
                    const hasAttachments = complaint.attachments && complaint.attachments.length > 0;
                    const icon = hasAttachments ? '✅' : '❌';
                    console.log(`${icon} ${complaint.complaint_number} - ${complaint.citizen_name}`);
                    
                    if (hasAttachments) {
                        console.log(`   Attachments: ${complaint.attachments.length}`);
                        complaint.attachments.forEach(att => {
                            console.log(`   - ${att.file_name}`);
                            console.log(`     URL: ${att.file_url.substring(0, 80)}...`);
                        });
                    } else {
                        console.log(`   No attachments`);
                    }
                    console.log('');
                });
            } else {
                console.log('❌ API returned error:', response);
            }
        } catch (error) {
            console.error('❌ Error parsing response:', error.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
});

req.end();
