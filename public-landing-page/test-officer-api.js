// Test script to verify officer management API
// Using built-in fetch (Node 18+)

async function testOfficerAPI() {
    console.log('🧪 Testing Officer Management API...\n');
    
    try {
        // Test 1: Backend health check
        console.log('1️⃣ Testing backend health...');
        const healthResponse = await fetch('http://localhost:5000/health');
        const healthData = await healthResponse.json();
        console.log('✅ Backend Status:', healthData.status);
        console.log('✅ Database:', healthData.database);
        console.log('');
        
        // Test 2: Fetch departments
        console.log('2️⃣ Testing departments API...');
        const deptsResponse = await fetch('http://localhost:5000/api/v1/admin/departments');
        const deptsData = await deptsResponse.json();
        
        if (deptsData.success) {
            console.log('✅ Departments API: Success');
            console.log(`✅ Total Departments: ${deptsData.data.length}`);
            
            if (deptsData.data.length > 0) {
                console.log('\n📋 Sample Department:');
                const sample = deptsData.data[0];
                console.log('   - ID:', sample.id);
                console.log('   - Name:', sample.name || sample.department_name);
            } else {
                console.log('⚠️  No departments found - you may need to add departments first');
            }
        }
        console.log('');
        
        // Test 3: Fetch officers
        console.log('3️⃣ Testing officers API...');
        const officersResponse = await fetch('http://localhost:5000/api/v1/admin/officers');
        const officersData = await officersResponse.json();
        
        if (officersData.success) {
            const officers = officersData.data || [];
            console.log('✅ Officers API: Success');
            console.log(`✅ Total Officers: ${officers.length}`);
            
            if (officers.length > 0) {
                console.log('\n👮 Sample Officer:');
                const sample = officers[0];
                console.log('   - ID:', sample.id);
                console.log('   - Name:', sample.full_name);
                console.log('   - Email:', sample.email);
                console.log('   - Mobile:', sample.mobile);
                console.log('   - Department:', sample.department_name);
                console.log('   - Status:', sample.status);
            } else {
                console.log('⚠️  No officers found in database');
            }
        }
        
        console.log('\n✅ All tests passed! Officer management page should work correctly.');
        console.log('\n📍 Open http://localhost:3000/admin/officers in your browser');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure backend is running: cd backend && npm start');
        console.log('   2. Make sure frontend is running: npm run dev');
        console.log('   3. Check if database is connected');
        console.log('   4. You may need to restart the backend after adding the new endpoint');
    }
}

testOfficerAPI();
