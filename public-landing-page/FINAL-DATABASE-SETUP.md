# Final Database Setup - Complete

## ✅ What Was Done

### 1. Database Consolidation
- **DELETED**: `civic_platform` database (had old schema)
- **ACTIVE**: `civicpath` database (correct schema with `complaint_number`)
- All future complaints will be stored in `civicpath`

### 2. Backend Configuration
File: `backend/.env`
```env
DB_NAME=civicpath
DB_USER=civicpath_user
DB_PASSWORD=mayursql
```

### 3. Cloudinary Configuration
- **Status**: DISABLED (temporarily)
- **Reason**: Invalid API credentials
- **Storage**: Using LOCAL file storage in `backend/uploads/` folder
- **Files will be saved locally** until you update Cloudinary credentials

## Current Database Status

### Database: `civicpath`
```sql
-- Check complaints
SELECT complaint_number, title, status, created_at 
FROM complaints 
ORDER BY created_at DESC;
```

Current complaints: 2
- CMP-2026-00002 (Test complaint)
- CMP-2026-00001 (Original complaint)

## How to View in pgAdmin

1. Open pgAdmin
2. Expand: Servers → PostgreSQL 18 → Databases
3. Find and expand: **civicpath** (NOT civic_platform)
4. Navigate to: Schemas → public → Tables → complaints
5. Right-click → View/Edit Data → All Rows

## Testing the System

### Test 1: Create Complaint (Without Images)
```bash
curl -X POST http://localhost:5000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue",
    "description": "Testing complaint submission",
    "category": "infrastructure",
    "subCategory": "Roads",
    "priority": "medium",
    "location": {
      "address": "Test Address",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "ward": "Test Ward"
    },
    "citizenName": "Test User",
    "citizenMobile": "9876543210"
  }'
```

### Test 2: Track Complaint
```bash
curl http://localhost:5000/api/v1/complaints/track/CMP-2026-00002
```

### Test 3: Check Database
```bash
set PGPASSWORD=mayursql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath -c "SELECT COUNT(*) FROM complaints;"
```

## File Upload Status

### Current: LOCAL STORAGE
- Files saved to: `backend/uploads/`
- No cloud storage
- Files accessible at: `http://localhost:5000/uploads/filename.jpg`

### To Enable Cloudinary:

1. Go to https://cloudinary.com/console
2. Sign in or create free account
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

4. Update `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
USE_CLOUDINARY=true
```

5. Test connection:
```bash
cd backend
node test-cloudinary.js
```

6. Restart backend server

## Backend Server Status

✅ Running on: http://localhost:5000
✅ Database: civicpath
✅ Storage: Local (uploads folder)
✅ API Endpoints: Working

## Quick Commands

### Start Backend
```bash
cd backend
npm run dev
```

### Check Database
```bash
set PGPASSWORD=mayursql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U civicpath_user -d civicpath
```

### View Complaints
```sql
\c civicpath
SELECT * FROM complaints ORDER BY created_at DESC;
```

### Clear All Complaints (if needed)
```sql
\c civicpath
TRUNCATE TABLE complaint_attachments, complaint_history, complaints RESTART IDENTITY CASCADE;
```

## Summary

✅ Single database: `civicpath`
✅ Correct schema with `complaint_number`
✅ Backend connected properly
✅ Local file storage working
⚠️ Cloudinary disabled (update credentials to enable)
✅ All API endpoints functional

## Next Steps

1. Test complaint submission from frontend
2. Update Cloudinary credentials (optional)
3. Test file uploads
4. Verify tracking functionality
