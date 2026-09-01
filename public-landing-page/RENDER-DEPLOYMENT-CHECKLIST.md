# Render Deployment Checklist ✅

## What You Need

1. Your Render **Backend URL** (e.g., `https://civicpath-backend-xyz.onrender.com`)
2. Your Render **Frontend URL** (e.g., `https://civicpath-app-abc.onrender.com`)
3. Access to Render Dashboard

---

## Step-by-Step Deployment

### ✅ Step 1: Set Environment Variable on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your **Frontend/Web Service** (the one with your citizen dashboard)
3. Click **Environment** tab on the left
4. Click **Add Environment Variable**
5. Add:
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://your-backend-name.onrender.com
   ```
   **Replace** `your-backend-name` with your actual backend URL!

6. Click **Save Changes**

**Render will automatically start redeploying** (takes 5-10 minutes)

---

### ✅ Step 2: Update Backend CORS (Important!)

1. Still in Render Dashboard
2. Click on your **Backend Service**
3. Click **Environment** tab
4. Find `CORS_ORIGIN` variable (or add it if missing)
5. Update to include your frontend URL:
   ```
   Key: CORS_ORIGIN
   Value: https://your-frontend.onrender.com,http://localhost:3000
   ```

6. Click **Save Changes**
7. Backend will redeploy

---

### ✅ Step 3: Wait for Deployment

Watch the deployment logs:
- Frontend: Should take 5-10 minutes
- Backend: Should take 2-5 minutes

Look for:
```
==> Build successful 🎉
==> Deploying...
==> Your service is live 🎉
```

---

### ✅ Step 4: Test Your Deployment

#### Test Backend
Open in browser:
```
https://your-backend.onrender.com/health
```

Should show:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

#### Test Admin Panel
Open in browser:
```
https://your-frontend.onrender.com/admin/complaints
```

Should show:
- Complaints list (or empty state if no complaints)
- No errors in browser console

#### Test Full Flow
1. **Submit Complaint**:
   - Go to: `https://your-frontend.onrender.com/citizen/report`
   - Fill form and submit
   - Should see success message

2. **View in Admin**:
   - Go to: `https://your-frontend.onrender.com/admin/complaints`
   - Should see your new complaint!

3. **Add Officer**:
   - Go to: `https://your-frontend.onrender.com/admin/officers`
   - Click "Add Officer"
   - Fill form and save
   - Should appear in list

---

## All Your URLs

After deployment, you'll have:

### Public Access
```
https://your-frontend.onrender.com/citizen
```
- Report complaints
- Track complaints
- Public dashboard

### Admin Access
```
https://your-frontend.onrender.com/admin/dashboard
https://your-frontend.onrender.com/admin/complaints
https://your-frontend.onrender.com/admin/officers
https://your-frontend.onrender.com/admin/departments
https://your-frontend.onrender.com/admin/analytics
```

### Officer Access
```
https://your-frontend.onrender.com/desk/dashboard
https://your-frontend.onrender.com/desk/tasks
```

### MLA Access
```
https://your-frontend.onrender.com/mla/dashboard
https://your-frontend.onrender.com/mla/issues
```

### Backend API
```
https://your-backend.onrender.com/api/v1/complaints
https://your-backend.onrender.com/api/v1/admin/officers
https://your-backend.onrender.com/health
```

---

## Troubleshooting

### Issue: "Failed to load complaints"

**Check**:
1. Is backend running? Visit: `https://your-backend.onrender.com/health`
2. Is `NEXT_PUBLIC_API_URL` set correctly in frontend environment?
3. Check Render logs for errors

**Solution**:
- Go to Render Dashboard → Frontend → Logs
- Look for error messages
- Make sure environment variable has no typos

### Issue: CORS Error in Browser Console

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
1. Go to Backend service on Render
2. Environment tab
3. Update `CORS_ORIGIN` to include frontend URL
4. Save and redeploy

### Issue: 404 Not Found

**Check**:
1. Backend URL is correct (no trailing slash)
2. Backend is deployed and running
3. API routes exist

**Solution**:
- Verify backend URL in environment variable
- Check backend logs for startup errors

### Issue: Database Connection Error

**Error**: `Database disconnected`

**Solution**:
1. Check database is running on Render
2. Verify database credentials in backend environment
3. Check database logs
4. Make sure schema is set up

---

## Environment Variables Summary

### Frontend Service
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Backend Service
```
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database (from Render PostgreSQL)
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=civicpath_xxxx
DB_USER=civicpath_user_xxxx
DB_PASSWORD=xxxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
USE_CLOUDINARY=true

# CORS
CORS_ORIGIN=https://your-frontend.onrender.com,http://localhost:3000

# JWT
JWT_SECRET=your_long_random_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## Quick Test Commands

### Test Backend Health
```bash
curl https://your-backend.onrender.com/health
```

### Test Complaints API
```bash
curl https://your-backend.onrender.com/api/v1/complaints
```

### Test Officers API
```bash
curl https://your-backend.onrender.com/api/v1/admin/officers
```

---

## What's Already Done ✅

- ✅ Code updated to use environment variables
- ✅ Changes committed to GitHub
- ✅ Changes pushed to GitHub
- ✅ Render will auto-deploy from GitHub

## What You Need to Do 🎯

1. Set `NEXT_PUBLIC_API_URL` in Render frontend environment
2. Update `CORS_ORIGIN` in Render backend environment
3. Wait for deployments to complete
4. Test your admin panel!

---

## Success Indicators

You'll know it's working when:
- ✅ No errors in browser console
- ✅ Complaints load in admin panel
- ✅ Can add new officers
- ✅ Submitted complaints appear in admin
- ✅ All data persists in Render database

---

**Ready to deploy?** Just set those environment variables and you're done! 🚀

**Need help?** Share your Render URLs and any error messages!
