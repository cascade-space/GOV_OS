# Troubleshooting Backend Connection Issues

## Problem
Admin complaints page shows "Failed to load complaints" error.

## Quick Checks

### 1. Is Backend Running?
Check if your backend server is running on port 5000:

```bash
# Open a new terminal
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ Database connected successfully
☁️  Cloudinary configured successfully
```

### 2. Test Backend API Directly
Open your browser and visit:
```
http://localhost:5000/api/complaints
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "complaints": [],
    "pagination": {...}
  }
}
```

**If you see an error**, the backend has issues.

### 3. Check Database Connection
Make sure PostgreSQL is running and the database exists:

```bash
# Test database connection
cd backend
node -e "const {pool} = require('./src/config/database'); pool.query('SELECT NOW()').then(r => console.log('✅ DB Connected:', r.rows[0])).catch(e => console.error('❌ DB Error:', e.message))"
```

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Error:** `Failed to fetch` or `Network error`

**Solution:**
```bash
cd backend
npm install  # Install dependencies if needed
npm run dev  # Start backend server
```

### Issue 2: Port 5000 Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Then restart backend
npm run dev
```

### Issue 3: Database Not Connected
**Error:** `Database connection failed`

**Solution:**
1. Check if PostgreSQL is running
2. Verify `.env` file in backend folder:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civicpath_db
DB_USER=postgres
DB_PASSWORD=your_password
```

3. Test connection:
```bash
psql -U postgres -d civicpath_db -c "SELECT COUNT(*) FROM complaints;"
```

### Issue 4: CORS Error
**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
Backend should already have CORS enabled. Check `backend/src/server.js`:
```javascript
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

### Issue 5: No Complaints in Database
**Error:** Empty array `[]` returned

**Solution:**
This is normal if no complaints have been submitted yet.

1. Submit a test complaint at: `http://localhost:3000/citizen/report`
2. Refresh admin page: `http://localhost:3000/admin/complaints`

## Step-by-Step Debugging

### Step 1: Check Backend Logs
Look at the backend terminal for errors when the admin page loads.

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when loading admin page
4. Check Network tab for failed requests

### Step 3: Test API Endpoint
```bash
# Using curl (if available)
curl http://localhost:5000/api/complaints

# Or visit in browser
http://localhost:5000/api/complaints
```

### Step 4: Check Database
```bash
# Connect to database
psql -U postgres -d civicpath_db

# Check if complaints table exists
\dt

# Check complaints count
SELECT COUNT(*) FROM complaints;

# View recent complaints
SELECT id, complaint_number, title, status FROM complaints ORDER BY created_at DESC LIMIT 5;
```

## Quick Fix Commands

### Restart Everything
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - Database (if needed)
# Windows: Start PostgreSQL service
# Or use pgAdmin
```

### Install Missing Dependencies
```bash
# Backend
cd backend
npm install uuid  # If UUID package is missing
npm install

# Frontend
cd ..
npm install
```

### Reset Database (if needed)
```bash
cd backend
psql -U postgres -d civicpath_db -f ../database/schema.sql
```

## Still Not Working?

### Check These Files:
1. `backend/.env` - Database credentials
2. `backend/src/config/database.js` - Database configuration
3. `backend/src/server.js` - Server setup
4. `backend/src/routes/complaint.routes.js` - API routes

### Get Help:
1. Check backend terminal for error messages
2. Check browser console for frontend errors
3. Test API endpoint directly in browser
4. Verify database has data

## Success Checklist

- [ ] Backend running on port 5000
- [ ] Database connected successfully
- [ ] Can access `http://localhost:5000/api/complaints` in browser
- [ ] Frontend running on port 3000
- [ ] No CORS errors in browser console
- [ ] At least one complaint exists in database

Once all items are checked, the admin complaints page should work!
