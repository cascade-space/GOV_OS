// Script to add sample departments to the database
const { Pool } = require('pg');

// Use the Render database URL directly
const pool = new Pool({
    connectionString: 'postgresql://civicpath_db_user:pret9eicHI9KtRKzBEGpt1sLSV74buRH@dpg-d6ft9mrh46gs738k11c0-a.singapore-postgres.render.com/civicpath_db',
    ssl: { rejectUnauthorized: false }
});

const departments = [
    {
        name: 'Roads & Public Works',
        code: 'RPW',
        description: 'Handles road maintenance, construction, and public infrastructure',
        contact_email: 'roads@civic.gov',
        contact_phone: '9876543210'
    },
    {
        name: 'Water Supply',
        code: 'WS',
        description: 'Manages water supply, distribution, and quality',
        contact_email: 'water@civic.gov',
        contact_phone: '9876543211'
    },
    {
        name: 'Electricity Board',
        code: 'EB',
        description: 'Handles electrical infrastructure and power supply',
        contact_email: 'electricity@civic.gov',
        contact_phone: '9876543212'
    },
    {
        name: 'Sanitation Department',
        code: 'SD',
        description: 'Manages waste collection, drainage, and sanitation',
        contact_email: 'sanitation@civic.gov',
        contact_phone: '9876543213'
    },
    {
        name: 'Street Lighting',
        code: 'SL',
        description: 'Maintains street lights and public lighting',
        contact_email: 'lighting@civic.gov',
        contact_phone: '9876543214'
    }
];

async function addDepartments() {
    console.log('🏢 Adding sample departments...\n');
    
    try {
        // Check if departments already exist
        const checkQuery = 'SELECT COUNT(*) FROM departments';
        const checkResult = await pool.query(checkQuery);
        const count = parseInt(checkResult.rows[0].count);
        
        if (count > 0) {
            console.log(`⚠️  ${count} departments already exist in database`);
            console.log('Skipping department creation to avoid duplicates\n');
            
            // Show existing departments
            const existingQuery = 'SELECT id, name, code FROM departments ORDER BY name';
            const existingResult = await pool.query(existingQuery);
            console.log('📋 Existing Departments:');
            existingResult.rows.forEach((dept, index) => {
                console.log(`   ${index + 1}. ${dept.name} (${dept.code}) - ID: ${dept.id}`);
            });
            
            await pool.end();
            return;
        }
        
        // Insert departments
        const insertQuery = `
            INSERT INTO departments (name, code, description, contact_email, contact_phone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, code
        `;
        
        for (const dept of departments) {
            const result = await pool.query(insertQuery, [
                dept.name,
                dept.code,
                dept.description,
                dept.contact_email,
                dept.contact_phone
            ]);
            
            const created = result.rows[0];
            console.log(`✅ Created: ${created.name} (${created.code}) - ID: ${created.id}`);
        }
        
        console.log(`\n✅ Successfully added ${departments.length} departments!`);
        console.log('\n📍 You can now add officers at http://localhost:3000/admin/officers');
        
    } catch (error) {
        console.error('❌ Error adding departments:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure PostgreSQL is running');
        console.log('   2. Check database credentials in backend/.env');
        console.log('   3. Verify the departments table exists');
    } finally {
        await pool.end();
    }
}

addDepartments();
