# Connect Local Backend to Render Database

## Current Situation
- Your **backend** is running locally (`localhost:5000`)
- Your **frontend** is running locally (`localhost:3000`)
- Your **database** is running locally (`localhost:5432`)
- You have a **Render database** but it's not connected

## The Problem
When you submit a complaint from the report page, it goes to your **local database**. When you check the admin page, it also reads from your **local database**. They should be connected!

## Solution: Choose Your Setup

### ✅ OPTION 1: Keep Everything Local (Recommended for Development)

This is the **easiest** and **fastest** option for development.

#### Step 1: Verify Local Database is Running
```bash
# Check if PostgreSQL is running
# On Windows, check Services or run:
pg_isready -h localhost -p 5432
```

#### Step 2: Verify Backend is Connected
```bash
cd backend
npm start
```

Look for this message:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

#### Step 3: Test the Connection
```bash
# Test complaints API
curl http://localhost:5000/api/v1/complaints

# Test health
curl http://localhost:5000/health
```

#### Step 4: Submit a Test Complaint
1. Go to `http://localhost:3000/citizen/report`
2. Fill in the form and submit
3. Go to `http://localhost:3000/admin/complaints`
4. You should see your complaint!

**If this works, you're done! No need for Render database in development.**

---

### 🌐 OPTION 2: Connect Local Backend to Render Database

Use this if you want to test with production data or share data across machines.

#### Prerequisites
You need your Render database credentials. If you don't have them, skip to "How to Get Render Database Credentials" below.

#### Step 1: Get Render Database Credentials

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your PostgreSQL database
3. Scroll down to "Connections"
4. Copy the **External Database URL** or individual credentials:
   - Host
   - Port
   - Database Name
   - Username
   - Password

It will look like:
```
postgres://username:password@hostname.region.render.com:5432/database_name
```

#### Step 2: Update Your Local .env File

**File**: `backend/.env`

Replace the database section with your Render credentials:

```env
# Database Configuration - RENDER DATABASE
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=civicpath_xxxx
DB_USER=civicpath_user_xxxx
DB_PASSWORD=your_render_password_here
DB_POOL_MIN=2
DB_POOL_MAX=10
```

**Example with actual Render format:**
```env
DB_HOST=dpg-ct234abc5def6gh7-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=civicpath_db
DB_USER=civicpath_user
DB_PASSWORD=AbCdEfGh123456789
```

#### Step 3: Restart Your Backend
```bash
cd backend
# Stop the server (Ctrl+C)
npm start
```

Look for:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

#### Step 4: Test the Connection
```bash
# Test health endpoint
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

#### Step 5: Verify Data Flow
1. Submit a complaint: `http://localhost:3000/citizen/report`
2. Check admin page: `http://localhost:3000/admin/complaints`
3. Data should appear!

---

## How to Get Render Database Credentials

### If You Don't Have a Render Database Yet

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up for free account
3. Verify your email

#### Step 2: Create PostgreSQL Database
1. Click "New +" button
2. Select "PostgreSQL"
3. Fill in:
   - **Name**: `civicpath-db`
   - **Database**: `civicpath`
   - **User**: `civicpath_user`
   - **Region**: Choose closest to you
   - **Plan**: Free (for testing)
4. Click "Create Database"

#### Step 3: Wait for Database to be Ready
- Takes 2-5 minutes
- Status will change from "Creating" to "Available"

#### Step 4: Get Connection Details
1. Click on your database
2. Scroll to "Connections" section
3. Copy the credentials:
   - **Internal Database URL** (for Render services)
   - **External Database URL** (for local development)

#### Step 5: Setup Database Schema
You need to create the tables in your Render database.

**Option A: Using pgAdmin**
1. Open pgAdmin
2. Add new server with Render credentials
3. Run the schema file: `database/schema.sql`

**Option B: Using Command Line**
```bash
# Install PostgreSQL client if not installed
# Then run:
psql "postgres://username:password@hostname.render.com:5432/database_name" -f database/schema.sql
```

**Option C: Using Node Script**
```bash
node setup-render-db.js
```

---

## Troubleshooting

### Error: "Connection Refused"
**Problem**: Can't connect to database

**Solutions**:
1. Check if database is running (local or Render)
2. Verify credentials in `.env` file
3. Check firewall settings
4. For Render: Make sure database status is "Available"

### Error: "Authentication Failed"
**Problem**: Wrong username or password

**Solutions**:
1. Double-check credentials in Render dashboard
2. Copy-paste to avoid typos
3. Check for extra spaces in `.env` file

### Error: "Relation does not exist"
**Problem**: Tables not created in database

**Solutions**:
1. Run schema file: `database/schema.sql`
2. Use pgAdmin to create tables
3. Run setup script: `node setup-render-db.js`

### Complaints Not Showing in Admin
**Problem**: Data in different database

**Solutions**:
1. Check which database backend is connected to
2. Verify `.env` file has correct credentials
3. Restart backend after changing `.env`
4. Check backend logs for connection info

---

## Recommended Setup for Your Situation

Based on your question, I recommend:

### For Development (Right Now)
**Use Option 1: Keep Everything Local**
- Faster
- No internet required
- Free
- Easier to debug

### For Production (Later)
**Deploy Everything to Render**
- Backend on Render Web Service
- Database on Render PostgreSQL
- Frontend on Vercel/Netlify

---

## Quick Test Script

Create this file to test your database connection:

**File**: `test-database-connection.js`

```javascript
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
    console.log('');
    
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Connection successful!');
        console.log('✅ Server time:', result.rows[0].now);
        
        // Check if complaints table exists
        const tableCheck = await pool.query(`
            SELECT COUNT(*) FROM complaints
        `);
        console.log('✅ Complaints table exists');
        console.log('✅ Total complaints:', tableCheck.rows[0].count);
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('  1. Check if database is running');
        console.log('  2. Verify credentials in backend/.env');
        console.log('  3. Check firewall settings');
    } finally {
        await pool.end();
    }
}

testConnection();
```

Run it:
```bash
node test-database-connection.js
```

---

## Summary

**Current Issue**: Your local backend and admin page are not connected to the same database.

**Quick Fix**: 
1. Make sure your local PostgreSQL is running
2. Restart your backend: `cd backend && npm start`
3. Test: Submit complaint → Check admin page

**If you want to use Render database**:
1. Get Render database credentials
2. Update `backend/.env` with Render credentials
3. Restart backend
4. Run schema setup on Render database

---

**Need Help?** Run these commands and share the output:
```bash
# Test backend health
curl http://localhost:5000/health

# Test database connection
node test-database-connection.js

# Check complaints
curl http://localhost:5000/api/v1/complaints
```
