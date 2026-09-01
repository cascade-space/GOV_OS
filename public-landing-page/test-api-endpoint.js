// Test if the API endpoint exists
const https = require('https');

const testEndpoint = (url, description) => {
    console.log(`\nTesting: ${description}`);
    console.log(`URL: ${url}`);
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            try {
                console.log('Response:', JSON.parse(data));
            } catch {
                console.log('Response:', data);
            }
        });
    }).on('error', (err) => {
        console.error('Error:', err.message);
    });
};

// Test various endpoints
testEndpoint('https://civicpath.onrender.com/', 'Root');
testEndpoint('https://civicpath.onrender.com/health', 'Health Check');
testEndpoint('https://civicpath.onrender.com/api/v1/complaints', 'Complaints Endpoint (GET)');

console.log('\n=== Testing Complete ===\n');
console.log('Expected POST endpoint: https://civicpath.onrender.com/api/v1/complaints');
console.log('This is where the frontend should submit complaints.');
