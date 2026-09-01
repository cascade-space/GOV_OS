# PostgreSQL Database Setup Guide for CivicPath

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Database Creation](#database-creation)
4. [Schema Setup](#schema-setup)
5. [Seed Data](#seed-data)
6. [Verification](#verification)
7. [Connection Configuration](#connection-configuration)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before starting, ensure you have:
- PostgreSQL 12 or higher installed
- Command line access (Terminal/PowerShell/CMD)
- Basic knowledge of SQL
- Admin/superuser access to PostgreSQL

---

## 📥 Installation Steps

### Windows

#### Option 1: Using Official Installer
1. **Download PostgreSQL**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the latest version (14.x or 15.x recommended)
   - Run the installer

2. **Installation Wizard**
   - Click "Next" through the welcome screen
   - Choose installation directory (default: `C:\Program Files\PostgreSQL\15`)
   - Select components:
     - ✅ PostgreSQL Server
     - ✅ pgAdmin 4 (GUI tool)
     - ✅ Command Line Tools
     - ✅ Stack Builder (optional)
   - Choose data directory (default: `C:\Program Files\PostgreSQL\15\data`)
   - Set password for `postgres` superuser (REMEMBER THIS!)
   - Port: 5432 (default)
   - Locale: Default locale
   - Click "Next" and "Install"

3. **Verify Installation**
   ```cmd
   psql --version
   ```
   Should show: `psql (PostgreSQL) 15.x`

#### Option 2: Using Chocolatey
```powershell
choco install postgresql
```

### macOS

#### Using Homebrew
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

---

## 🗄️ Database Creation

### Step 1: Access PostgreSQL

#### Windows
```cmd
# Open Command Prompt or PowerShell
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\15\bin"

# Connect to PostgreSQL
psql -U postgres
```

#### macOS/Linux
```bash
# Connect to PostgreSQL
sudo -u postgres psql
```

You'll see the PostgreSQL prompt:
```
postgres=#
```

### Step 2: Create Database

```sql
-- Create the database
CREATE DATABASE civicpath;

-- Verify database was created
\l

-- Connect to the new database
\c civicpath

-- You should now see:
-- civicpath=#
```

### Step 3: Create Database User (Optional but Recommended)

```sql
-- Create a dedicated user for the application
CREATE USER civicpath_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE civicpath TO civicpath_user;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO civicpath_user;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO civicpath_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO civicpath_user;
```

---

## 📊 Schema Setup

### Step 1: Navigate to Project Directory

```cmd
# Windows
cd C:\Users\YourName\Desktop\CIVIC Project\civi1.1\database

# macOS/Linux
cd ~/Desktop/CIVIC\ Project/civi1.1/database
```

### Step 2: Run Schema Script

#### Method 1: Using psql Command Line

```bash
# Connect to database and run schema
psql -U postgres -d civicpath -f schema.sql

# Or if using the dedicated user
psql -U civicpath_user -d civicpath -f schema.sql
```

#### Method 2: Using psql Interactive Mode

```bash
# Connect to database
psql -U postgres -d civicpath

# Run the schema file
\i schema.sql

# Or with full path
\i C:/Users/YourName/Desktop/CIVIC Project/civi1.1/database/schema.sql
```

#### Method 3: Using pgAdmin 4 (GUI)

1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Right-click on "civicpath" database → Query Tool
4. Click "Open File" icon
5. Select `schema.sql`
6. Click "Execute" (F5)

### Step 3: Verify Schema Creation

```sql
-- List all tables
\dt

-- You should see tables like:
-- users, departments, officers, complaints, etc.

-- Check table structure
\d complaints

-- Count tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should return around 15-20 tables
```

---

## 🌱 Seed Data

### Step 1: Load Sample Data

```bash
# Using psql command line
psql -U postgres -d civicpath -f seed-data.sql

# Or in interactive mode
psql -U postgres -d civicpath
\i seed-data.sql
```

### Step 2: Verify Data

```sql
-- Check users
SELECT username, full_name, role FROM users;

-- Check departments
SELECT name, code FROM departments;

-- Check complaints
SELECT complaint_number, title, status FROM complaints;

-- Check officers
SELECT u.full_name, o.employee_id, d.name as department
FROM officers o
JOIN users u ON o.user_id = u.id
JOIN departments d ON o.department_id = d.id;
```

---

## ✅ Verification

### Run These Queries to Verify Everything Works

```sql
-- 1. Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

-- 3. Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- 4. Test complaint number generation
SELECT generate_complaint_number();

-- 5. Test SLA calculation
SELECT calculate_sla_deadline('high', 'Roads & Infrastructure');

-- 6. Check active complaints view
SELECT * FROM v_active_complaints LIMIT 5;

-- 7. Check officer performance view
SELECT * FROM v_officer_performance;

-- 8. Check department statistics view
SELECT * FROM v_department_statistics;

-- 9. Count records in each table
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'officers', COUNT(*) FROM officers
UNION ALL
SELECT 'complaints', COUNT(*) FROM complaints
UNION ALL
SELECT 'constituencies', COUNT(*) FROM constituencies;
```

Expected Results:
- users: 7 records
- departments: 5 records
- officers: 5 records
- complaints: 5 records
- constituencies: 3 records

---

## 🔌 Connection Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civicpath
DB_USER=civicpath_user
DB_PASSWORD=your_secure_password_here

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10

# Database URL (alternative format)
DATABASE_URL=postgresql://civicpath_user:your_secure_password_here@localhost:5432/civicpath
```

### Node.js Connection Example

Install required packages:
```bash
npm install pg dotenv
```

Create `src/lib/db.ts`:
```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'civicpath',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

export default pool;
```

### Test Connection

Create `test-db-connection.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'civicpath',
    user: 'postgres',
    password: 'your_password_here',
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to database successfully!');
        
        const result = await client.query('SELECT NOW()');
        console.log('Current time from database:', result.rows[0].now);
        
        const countResult = await client.query('SELECT COUNT(*) FROM complaints');
        console.log('Total complaints:', countResult.rows[0].count);
        
        client.release();
        await pool.end();
        console.log('✅ Connection test completed!');
    } catch (err) {
        console.error('❌ Database connection error:', err);
    }
}

testConnection();
```

Run test:
```bash
node test-db-connection.js
```

---

## 🔍 Troubleshooting

### Issue 1: "psql: command not found"

**Solution:**
Add PostgreSQL to PATH:

**Windows:**
1. Search "Environment Variables" in Start Menu
2. Click "Environment Variables"
3. Under "System Variables", find "Path"
4. Click "Edit"
5. Add: `C:\Program Files\PostgreSQL\15\bin`
6. Click OK and restart terminal

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"

# Reload
source ~/.bashrc
```

### Issue 2: "password authentication failed"

**Solution:**
Reset postgres password:

```bash
# Windows (as Administrator)
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';

# Linux
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_password';
```

### Issue 3: "could not connect to server"

**Solution:**
Check if PostgreSQL is running:

**Windows:**
```cmd
# Check service status
sc query postgresql-x64-15

# Start service
net start postgresql-x64-15
```

**macOS:**
```bash
brew services list
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Issue 4: "permission denied for schema public"

**Solution:**
```sql
-- Connect as postgres superuser
psql -U postgres -d civicpath

-- Grant permissions
GRANT ALL ON SCHEMA public TO civicpath_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO civicpath_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO civicpath_user;
```

### Issue 5: "relation does not exist"

**Solution:**
Schema not loaded properly. Re-run:
```bash
psql -U postgres -d civicpath -f schema.sql
```

### Issue 6: Port 5432 already in use

**Solution:**
```bash
# Find process using port 5432
# Windows
netstat -ano | findstr :5432

# macOS/Linux
lsof -i :5432

# Kill the process or change PostgreSQL port in postgresql.conf
```

---

## 📚 Additional Resources

### PostgreSQL Documentation
- Official Docs: https://www.postgresql.org/docs/
- Tutorial: https://www.postgresqltutorial.com/

### GUI Tools
- **pgAdmin 4** (Free, included with PostgreSQL)
- **DBeaver** (Free, cross-platform)
- **TablePlus** (Paid, beautiful UI)
- **DataGrip** (Paid, by JetBrains)

### Useful Commands

```sql
-- List all databases
\l

-- Connect to database
\c database_name

-- List all tables
\dt

-- Describe table structure
\d table_name

-- List all views
\dv

-- List all functions
\df

-- Show current database
SELECT current_database();

-- Show current user
SELECT current_user;

-- Exit psql
\q
```

---

## 🎯 Next Steps

After successful setup:

1. ✅ Update your `.env` file with database credentials
2. ✅ Test database connection from your application
3. ✅ Create API endpoints to interact with database
4. ✅ Implement authentication and authorization
5. ✅ Set up database backups
6. ✅ Configure connection pooling
7. ✅ Add database migrations system (optional)

---

## 🔐 Security Best Practices

1. **Never commit database passwords to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Use strong passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols

3. **Limit user permissions**
   - Don't use `postgres` superuser in production
   - Create role-specific users

4. **Enable SSL connections** (Production)
   ```sql
   ALTER SYSTEM SET ssl = on;
   ```

5. **Regular backups**
   ```bash
   # Backup database
   pg_dump -U postgres civicpath > backup.sql
   
   # Restore database
   psql -U postgres civicpath < backup.sql
   ```

---

## 📞 Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review PostgreSQL logs
3. Search PostgreSQL documentation
4. Ask on Stack Overflow with tag `postgresql`

---

**Last Updated:** February 24, 2026
**PostgreSQL Version:** 15.x
**Schema Version:** 1.0
