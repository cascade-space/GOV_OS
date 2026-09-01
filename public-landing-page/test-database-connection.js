require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function testConnection() {
    console.log('🧪 Testing Database Connection...\n');
    console.log('Configuration:');
    console.log('  Host:', process.env.DB_HOST);
    console.log('  Port:', process.env.DB_PORT);
    console.log('  Database:', process.env.DB_NAME);
    console.log('  User:', process.env.DB_USER);
    console.log('  Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET');
    console.log('');
    
    try {
        console.log('Attempting connection...');
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Connection successful!');
        console.log('✅ Server time:', result.rows[0].now);
        console.log('');
        
        // Check if complaints table exists
        try {
            const tableCheck = await pool.query('SELECT COUNT(*) FROM complaints');
            console.log('✅ Complaints table exists');
            console.log('✅ Total complaints:', tableCheck.rows[0].count);
            
            // Show sample complaint if any
            if (parseInt(tableCheck.rows[0].count) > 0) {
                const sample = await pool.query('SELECT complaint_number, title, status FROM complaints LIMIT 1');
                console.log('\n📋 Sample Complaint:');
                console.log('   Number:', sample.rows[0].complaint_number);
                console.log('   Title:', sample.rows[0].title);
                console.log('   Status:', sample.rows[0].status);
            }
        } catch (tableError) {
            console.log('⚠️  Complaints table does not exist');
            console.log('   You need to run the schema file: database/schema.sql');
        }
        
        console.log('\n✅ Database is properly connected!');
        console.log('📍 Your backend should work correctly with this database.');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('  ❌ Database server is not running or not reachable');
            console.log('  Solutions:');
            console.log('     1. Start PostgreSQL service');
            console.log('     2. Check if host and port are correct');
            console.log('     3. Check firewall settings');
        } else if (error.message.includes('authentication failed')) {
            console.log('  ❌ Wrong username or password');
            console.log('  Solutions:');
            console.log('     1. Check credentials in backend/.env');
            console.log('     2. Verify user exists in database');
        } else if (error.message.includes('database') && error.message.includes('does not exist')) {
            console.log('  ❌ Database does not exist');
            console.log('  Solutions:');
            console.log('     1. Create database: CREATE DATABASE civicpath;');
            console.log('     2. Check database name in backend/.env');
        } else {
            console.log('  Error details:', error.message);
        }
    } finally {
        await pool.end();
    }
}

testConnection();
