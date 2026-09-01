// Test Backend API Connection
const https = require('https');

const backendUrl = 'https://civicpath.onrender.com';

console.log('🔍 Testing backend connection...\n');

// Test 1: Health check
https.get(`${backendUrl}/health`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('✅ Backend Health Check:');
        console.log(JSON.parse(data));
        console.log('');
    });
}).on('error', (err) => {
    console.error('❌ Backend Health Check Failed:', err.message);
});

// Test 2: Root endpoint
https.get(`${backendUrl}/`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('✅ Backend Root Endpoint:');
        console.log(JSON.parse(data));
        console.log('');
    });
}).on('error', (err) => {
    console.error('❌ Backend Root Failed:', err.message);
});

console.log('Backend URL:', backendUrl);
console.log('Expected API endpoint:', `${backendUrl}/api/v1/complaints`);
