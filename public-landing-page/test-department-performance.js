const fetch = require('node-fetch');

async function testDepartmentPerformance() {
    try {
        console.log('Testing department performance endpoint...\n');
        
        const response = await fetch('http://localhost:5000/api/v1/mla/department-performance');
        const data = await response.json();
        
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (data.success && data.data.length > 0) {
            console.log('\n✅ Department performance data found!');
            console.log(`Total departments: ${data.data.length}`);
            data.data.forEach((dept, i) => {
                console.log(`\n${i + 1}. ${dept.department_name}`);
                console.log(`   - Total complaints: ${dept.total_complaints}`);
                console.log(`   - Resolved: ${dept.resolved_count}`);
                console.log(`   - SLA Compliance: ${dept.sla_compliance}%`);
                console.log(`   - Performance Score: ${dept.performance_score}`);
            });
        } else {
            console.log('\n⚠️ No department data available');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDepartmentPerformance();
