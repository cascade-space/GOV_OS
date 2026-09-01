# pgAdmin - Step by Step Fix

## What You're Seeing
Error: `database "civic_platform" does not exist`

## Why This Happens
pgAdmin has an open Query Tool tab trying to connect to the OLD database we deleted.

## Fix in 3 Steps

### Step 1: Close the Error Tab
1. Look at the top of pgAdmin window
2. Find the tab showing the error (it might say "civic_platform" or show a red error)
3. Click the **X** button on that tab to close it
4. Close ALL tabs if you're not sure which one

### Step 2: Open civicpath Database
1. Look at the LEFT panel (Object Explorer)
2. Expand: **Servers** → **PostgreSQL 18** → **Databases**
3. You should see: **civicpath** (this is the correct one!)
4. Right-click on **civicpath**
5. Select: **"Query Tool"**

### Step 3: Test the Connection
In the new Query Tool window, type:
```sql
SELECT current_database(), current_user;
```

Click the **Execute** button (▶️ play icon) or press **F5**

You should see:
```
current_database | current_user
-----------------+----------------
civicpath        | civicpath_user
```

## If You Still See Errors

### Option A: Restart pgAdmin
1. Close pgAdmin completely (File → Exit)
2. Open pgAdmin again
3. Follow Step 2 and 3 above

### Option B: Disconnect and Reconnect
1. In left panel, right-click on **PostgreSQL 18** server
2. Click **"Disconnect Server"**
3. Right-click again and click **"Connect Server"**
4. Enter password: `mayursql`
5. Follow Step 2 and 3 above

### Option C: Use Command Line Instead
Run this file: `test-civicpath-connection.bat`

Or manually:
```bash
set PGPASSWORD=mayursql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath
```

Then type:
```sql
SELECT * FROM complaints;
```

## Quick Test Queries

Once connected to civicpath, try these:

```sql
-- Count complaints
SELECT COUNT(*) FROM complaints;

-- View all complaints
SELECT complaint_number, title, status, created_at 
FROM complaints 
ORDER BY created_at DESC;

-- Check database info
SELECT 
    current_database() as database,
    current_user as user,
    version() as postgres_version;
```

## Important Notes

✅ The database **civicpath** EXISTS and is WORKING
✅ The backend is connected to **civicpath**
✅ Complaints ARE being stored in **civicpath**
❌ pgAdmin is trying to connect to **civic_platform** (deleted)

The error is ONLY in pgAdmin's UI, not in your actual system!

## Visual Guide

```
pgAdmin Window
├── Top: Tabs (close the error tab here)
├── Left: Object Explorer
│   └── Servers
│       └── PostgreSQL 18
│           └── Databases
│               ├── civicpath ← USE THIS ONE!
│               └── postgres
└── Right: Query Tool (opens when you right-click civicpath)
```

## Still Need Help?

Run: `test-civicpath-connection.bat`

This will test the database from command line and prove it's working!
