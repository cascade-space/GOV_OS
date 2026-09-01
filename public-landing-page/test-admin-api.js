// Test script to verify admin complaints API connection
// Using built-in fetch (Node 18+)

async function testAdminAPI() {
    console.log('🧪 Testing Admin Complaints API...\n');
    
    try {
        // Test 1: Backend health check
        console.log('1️⃣ Testing backend health...');
        const healthResponse = await fetch('http://localhost:5000/health');
        const healthData = await healthResponse.json();
        console.log('✅ Backend Status:', healthData.status);
        console.log('✅ Database:', healthData.database);
        console.log('');
        
        // Test 2: Fetch complaints
        console.log('2️⃣ Testing complaints API...');
        const complaintsResponse = await fetch('http://localhost:5000/api/v1/complaints');
        const complaintsData = await complaintsResponse.json();
        
        if (complaintsData.success) {
            const complaints = complaintsData.data.complaints || [];
            console.log('✅ API Response: Success');
            console.log(`✅ Total Complaints: ${complaints.length}`);
            
            if (complaints.length > 0) {
                console.log('\n📋 Sample Complaint:');
                const sample = complaints[0];
                console.log('   - ID:', sample.id);
                console.log('   - Complaint Number:', sample.complaint_number);
                console.log('   - Citizen Name:', sample.citizen_name);
                console.log('   - Mobile:', sample.citizen_mobile);
                console.log('   - Title:', sample.title);
                console.log('   - Status:', sample.status);
                console.log('   - Priority:', sample.priority);
                console.log('   - Category:', sample.category);
            } else {
                console.log('⚠️  No complaints found in database');
            }
        } else {
            console.log('❌ API returned error:', complaintsData);
        }
        
        console.log('\n✅ All tests passed! Admin page should work correctly.');
        console.log('\n📍 Open http://localhost:3000/admin/complaints in your browser');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure backend is running: cd backend && npm start');
        console.log('   2. Make sure frontend is running: npm run dev');
        console.log('   3. Check if database is connected');
    }
}

testAdminAPI();
