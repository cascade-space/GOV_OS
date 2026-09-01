const { Pool } = require('pg');

// Use the Render database URL directly
const pool = new Pool({
    connectionString: 'postgresql://civicpath_db_user:pret9eicHI9KtRKzBEGpt1sLSV74buRH@dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com/civicpath_db',
    ssl: { rejectUnauthorized: false }
});

async function checkDepartments() {
    try {
        console.log('🔍 Checking departments in database...\n');
        
        const result = await pool.query('SELECT * FROM departments ORDER BY name');
        
        if (result.rows.length === 0) {
            console.log('⚠️  No departments found in database!');
            console.log('\n📝 You need to add departments first.');
            console.log('   Run: node add-sample-departments.js');
        } else {
            console.log(`✅ Found ${result.rows.length} departments:\n`);
            result.rows.forEach((dept, index) => {
                console.log(`${index + 1}. ${dept.name} (ID: ${dept.id})`);
                console.log(`   Description: ${dept.description || 'N/A'}`);
                console.log(`   Status: ${dept.is_active ? 'Active' : 'Inactive'}\n`);
            });
        }
        
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

checkDepartments();
