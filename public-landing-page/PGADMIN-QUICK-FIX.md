# pgAdmin Quick Fix - 30 Seconds

## The Problem
You're seeing: `database "civic_platform" does not exist`

This is because pgAdmin is trying to connect to the OLD database we deleted.

## The Fix (Choose One)

### Fix 1: Close Error Tabs (FASTEST)
1. Look at pgAdmin tabs at the top
2. Find any tabs showing errors
3. Click the **X** to close them
4. Done!

### Fix 2: Restart pgAdmin (EASIEST)
1. Close pgAdmin completely
2. Open pgAdmin again
3. Navigate to: Servers → PostgreSQL 18 → Databases → **civicpath**
4. Done!

### Fix 3: Connect to Correct Database
1. In pgAdmin left panel, find: **Databases → civicpath**
2. Right-click on **civicpath**
3. Click **"Query Tool"**
4. Run: `SELECT * FROM complaints;`
5. Done!

## Verify It's Working

In the Query Tool, run:
```sql
SELECT complaint_number, title, status 
FROM complaints 
ORDER BY created_at DESC;
```

You should see 2 complaints:
- CMP-2026-00002
- CMP-2026-00001

## Important Notes

✅ **Backend is working fine** - Connected to civicpath
✅ **Database exists** - civicpath has 2 complaints
✅ **API is working** - http://localhost:5000/health returns OK
❌ **pgAdmin has old connection** - Just needs to be refreshed

## Still Having Issues?

The error is ONLY in pgAdmin, not in your actual system. You can:
1. Ignore the pgAdmin error
2. Use command line instead:
   ```bash
   set PGPASSWORD=mayursql
   "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath
   ```
3. Or just restart pgAdmin

Your backend and database are working perfectly! 🎉
