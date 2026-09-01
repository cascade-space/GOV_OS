# Update All API URLs to Use Environment Variable

## What You Need

Your Render backend URL. Example:
```
https://civicpath-backend.onrender.com
```

## Step-by-Step Instructions

### 1. Create Environment File

Create file: `.env.local` in project root

```env
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-NAME.onrender.com
```

**Replace** `YOUR-BACKEND-NAME` with your actual Render service name!

### 2. Update Admin Complaints Page

**File**: `src/app/admin/complaints/page.tsx`

**Line 30** - Change from:
```typescript
const response = await fetch('http://localhost:5000/api/v1/complaints');
```

**To**:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/v1/complaints`);
```

### 3. Update Admin Officers Page

**File**: `src/app/admin/officers/page.tsx`

**Line 52** - Change from:
```typescript
const response = await fetch('http://localhost:5000/api/v1/admin/officers');
```

**To**:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/v1/admin/officers`);
```

**Line 68** - Change from:
```typescript
const response = await fetch('http://localhost:5000/api/v1/admin/departments');
```

**To**:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/v1/admin/departments`);
```

**Line 84** - Change from:
```typescript
const response = await fetch('http://localhost:5000/api/v1/admin/officers', {
```

**To**:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/v1/admin/officers`, {
```

### 4. Update Citizen Report Page (if needed)

**File**: `src/app/citizen/report/page.tsx`

Find any `fetch('http://localhost:5000/...` and replace with:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/v1/...`);
```

### 5. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 6. Test Everything

1. **Test Admin Complaints**:
   - Go to `http://localhost:3000/admin/complaints`
   - Should show complaints from Render database

2. **Test Admin Officers**:
   - Go to `http://localhost:3000/admin/officers`
   - Should show officers from Render database

3. **Test Submit Complaint**:
   - Go to `http://localhost:3000/citizen/report`
   - Submit a test complaint
   - Check if it appears in admin

---

## Verify Your Setup

### Check Backend URL
```bash
# Test your Render backend
curl https://your-backend.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Check Complaints API
```bash
curl https://your-backend.onrender.com/api/v1/complaints
```

Should return list of complaints.

---

## Common Issues

### Issue 1: CORS Error
**Error**: "Access to fetch blocked by CORS policy"

**Solution**: Update CORS in Render backend
1. Go to Render Dashboard → Your Backend
2. Environment tab
3. Add/Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=http://localhost:3000,https://your-frontend.onrender.com
   ```
4. Save and redeploy

### Issue 2: 404 Not Found
**Error**: "404 - Route not found"

**Solution**: Check your backend URL
- Make sure URL doesn't have trailing slash
- Verify backend is deployed and running
- Check Render logs for errors

### Issue 3: Environment Variable Not Working
**Error**: Still connecting to localhost

**Solution**:
1. Make sure file is named `.env.local` (not `.env`)
2. Restart dev server completely
3. Check if variable starts with `NEXT_PUBLIC_`
4. Clear browser cache

---

## Alternative: Use Render Frontend for Admin

Instead of running admin locally, you can:

1. Deploy admin pages to Render
2. Access admin at: `https://your-frontend.onrender.com/admin`
3. Everything will work automatically!

---

## What's Your Render Backend URL?

Share your Render backend URL and I'll give you the exact commands to run!

Format should be:
```
https://something.onrender.com
```
