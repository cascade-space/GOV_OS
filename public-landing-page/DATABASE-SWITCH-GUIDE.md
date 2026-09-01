# Database Switch Guide

## Current Situation

You have TWO databases:

### 1. `civic_platform` (OLD - what you're viewing in pgAdmin)
- Has old schema with `ticket_number` column
- Contains 5 old complaints
- NOT being used by backend anymore

### 2. `civicpath` (NEW - what backend is using)
- Has correct schema with `complaint_number` column
- Contains 2 new complaints
- Backend is NOW connected to this database

## Why Complaints Appear Missing

You're viewing `civic_platform` in pgAdmin, but the backend is saving to `civicpath`.

## Solution Options

### Option A: View Correct Database in pgAdmin (RECOMMENDED)

1. In pgAdmin, expand the `postgres` server
2. Find and expand `civicpath` database (not `civic_platform`)
3. Navigate to: Schemas → public → Tables → complaints
4. Right-click on complaints → View/Edit Data → All Rows

You'll see your new complaints there!

### Option B: Switch Backend to Use civic_platform

If you want to keep using `civic_platform`, we need to:

1. Update the schema in `civic_platform` to match the new schema
2. Run migration to rename `ticket_number` to `complaint_number`
3. Update all other tables to match

This is more complex and not recommended.

## Quick Test

Run this to see complaints in the CORRECT database:

```bash
# Windows Command Prompt
set PGPASSWORD=mayursql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT complaint_number, title, status, created_at FROM complaints ORDER BY created_at DESC;"
```

## Current Backend Configuration

File: `backend/.env`
```
DB_NAME=civicpath
DB_USER=civicpath_user
DB_PASSWORD=mayursql
```

## Cloudinary Issue

The error "Unknown API key 442387251121382" means:
- Your Cloudinary API key might be invalid or expired
- Get a new one from https://cloudinary.com/console
- Update in `backend/.env`:
  ```
  CLOUDINARY_API_KEY=your_new_key
  CLOUDINARY_API_SECRET=your_new_secret
  ```

## Recommendation

1. ✅ Keep using `civicpath` database (it has the correct schema)
2. ✅ View `civicpath` in pgAdmin (not `civic_platform`)
3. ✅ Fix Cloudinary credentials if you need file uploads
4. ❌ Don't switch back to `civic_platform` (old schema)

## Migration Option (If you want old data)

If you need the 5 old complaints from `civic_platform`:

```sql
-- Connect to civicpath database
-- Then run migration script to copy data
-- (We can create this script if needed)
```
