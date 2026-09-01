# How to Connect to civicpath Database in pgAdmin

## Method 1: Switch Database in Existing Connection

1. **In pgAdmin**, look at the left sidebar under "Servers" → "PostgreSQL 18"
2. You should see a list of databases including:
   - civic_platform (your current one)
   - civicpath (the one we need)
   - postgres
   
3. **Click on "civicpath"** database in the left sidebar
4. Right-click on "civicpath" → **"Query Tool"**
5. Run this query to see your data:
   ```sql
   SELECT * FROM complaints ORDER BY created_at DESC;
   ```

## Method 2: Create New Server Connection (if civicpath not visible)

If you don't see the civicpath database, follow these steps:

1. **In pgAdmin**, right-click on "Servers" in the left sidebar
2. Click **"Register" → "Server"**

3. **General Tab:**
   - Name: `CivicPath Database`

4. **Connection Tab:**
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `civicpath`
   - Username: `civicpath_user`
   - Password: `mayursql`
   - ✅ Check "Save password"

5. Click **"Save"**

6. Now expand: **Servers → CivicPath Database → Databases → civicpath → Schemas → public → Tables**

7. Right-click on **"complaints"** table → **"View/Edit Data" → "All Rows"**

## Quick Verification Query

Once connected to civicpath database, run this to verify:

```sql
-- Check total complaints
SELECT COUNT(*) as total_complaints FROM complaints;

-- View all complaints with details
SELECT 
    complaint_number,
    citizen_name,
    citizen_mobile,
    title,
    status,
    created_at
FROM complaints 
ORDER BY created_at DESC;
```

## Current Database Configuration

Your backend is now configured to use:
- **Database Name:** civicpath
- **User:** civicpath_user
- **Password:** mayursql
- **Host:** localhost
- **Port:** 5432

## What's the Difference?

- **civic_platform**: Your old database with different schema (incompatible)
- **civicpath**: New database with correct schema for this application

All new complaints will be saved to **civicpath** database.
