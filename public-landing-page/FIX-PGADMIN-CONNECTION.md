# Fix pgAdmin Connection Error

## Error You're Seeing
```
connection failed: FATAL: database "civic_platform" does not exist
```

## Why This Happens
pgAdmin has a saved connection/query to the old `civic_platform` database that we deleted.

## Solution: Update pgAdmin

### Option 1: Close the Old Connection Tab
1. In pgAdmin, look for any open tabs/windows
2. Find tabs that say "civic_platform" 
3. Close those tabs (X button)
4. Refresh the database list (F5)

### Option 2: Reconnect to Correct Database
1. In pgAdmin left sidebar, expand: **Servers → PostgreSQL 18 → Databases**
2. Right-click on **civicpath** database
3. Select **"Query Tool"** or **"Connect"**
4. Now you're connected to the correct database

### Option 3: Remove Saved Connection
1. In pgAdmin, go to **File → Preferences**
2. Look for **"Paths"** or **"Storage"**
3. Clear any saved connections
4. Restart pgAdmin

### Option 4: Restart pgAdmin
1. Close pgAdmin completely
2. Reopen pgAdmin
3. Expand: Servers → PostgreSQL 18 → Databases
4. You should only see **civicpath** (not civic_platform)
5. Right-click **civicpath** → Query Tool

## Verify Database Exists

Run this in Command Prompt:
```bash
set PGPASSWORD=mayursql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -l | findstr "civic"
```

You should see:
```
civicpath | postgres | UTF8 | ...
```

(No civic_platform should appear)

## Connect to civicpath in pgAdmin

### Step-by-Step:
1. Open pgAdmin
2. Left sidebar: **Servers** → **PostgreSQL 18** → **Databases**
3. Find **civicpath** (should be there)
4. Right-click **civicpath**
5. Select **"Query Tool"**
6. Run: `SELECT * FROM complaints;`

## If You Still See the Error

The error might be from:
1. **Old query tabs** - Close all tabs and reopen
2. **Saved queries** - Delete saved queries referencing civic_platform
3. **pgAdmin cache** - Restart pgAdmin
4. **Background connections** - Disconnect and reconnect to PostgreSQL server

## Quick Test

Run this to verify the database is working:
```bash
set PGPASSWORD=mayursql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT COUNT(*) FROM complaints;"
```

Should return:
```
 count 
-------
     2
(1 row)
```

## Summary

✅ Backend is using: **civicpath**
✅ Database exists: **civicpath**
❌ pgAdmin trying to connect to: **civic_platform** (deleted)

**Solution**: Update pgAdmin to connect to **civicpath** instead.
