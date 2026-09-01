# Deploy Separate Admin Frontend on Render

## Overview

You want 2 separate frontend deployments:
1. **Citizen Frontend** - Public access (already deployed)
2. **Admin Frontend** - Admin panel only (new deployment)

Both will connect to the same backend and database.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Citizen Frontend (Render)                     │
│  https://civicpath-citizen.onrender.com        │
│  - /citizen pages only                         │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  Backend API (Render)                          │
│  https://civicpath-backend.onrender.com        │
│  - All API endpoints                           │
│  - Connected to PostgreSQL                     │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  Admin Frontend (Render) - NEW                 │
│  https://civicpath-admin.onrender.com          │
│  - /admin pages only                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Step-by-Step Deployment

### Step 1: Create Admin-Only Build Configuration

We need to configure the build to only include admin pages.

**Option A: Use the same repository (Recommended)**

You can deploy the same codebase twice with different configurations. The admin deployment will just serve the `/admin` routes.

**Option B: Create separate repository**

Create a new repository with only admin pages (more complex, not recommended).

---

### Step 2: Deploy Admin Frontend on Render

#### 2.1 Go to Render Dashboard

1. Go to https://dashboard.render.com/
2. Click **New +** button
3. Select **Web Service**

#### 2.2 Connect Repository

1. Select **Connect a repository**
2. Choose your GitHub repository (same one as citizen frontend)
3. Click **Connect**

#### 2.3 Configure Service

Fill in the details:

**Name**: `civicpath-admin` (or any name you want)

**Region**: Same as your backend (e.g., Singapore)

**Branch**: `main`

**Root Directory**: Leave empty (or `.` if needed)

**Runtime**: `Node`

**Build Command**:
```bash
npm install && npm run build
```

**Start Command**:
```bash
npm start
```

**Plan**: Free (or paid if you want)

#### 2.4 Add Environment Variables

Click **Advanced** and add these environment variables:

```
NEXT_PUBLIC_API_URL=https://civicpath-db.onrender.com
```

(Replace with your actual backend URL)

**Important**: Use the same backend URL for both frontends!

#### 2.5 Create Service

Click **Create Web Service**

Render will start building and deploying (takes 5-10 minutes).

---

### Step 3: Update Backend CORS

Your backend needs to allow requests from BOTH frontends.

1. Go to Render Dashboard
2. Click on your **Backend** service
3. Go to **Environment** tab
4. Find `CORS_ORIGIN` variable
5. Update to include both frontend URLs:

```
CORS_ORIGIN=https://civicpath-frontend.onrender.com,https://civicpath-admin.onrender.com,http://localhost:3000
```

**Format**:
```
CORS_ORIGIN=<citizen-url>,<admin-url>,http://localhost:3000
```

6. Click **Save Changes**
7. Backend will redeploy

---

### Step 4: Access Your Deployments

After deployment completes:

**Citizen Frontend**:
```
https://civicpath-frontend.onrender.com/citizen
https://civicpath-frontend.onrender.com/citizen/report
https://civicpath-frontend.onrender.com/citizen/track
```

**Admin Frontend**:
```
https://civicpath-admin.onrender.com/admin/dashboard
https://civicpath-admin.onrender.com/admin/complaints
https://civicpath-admin.onrender.com/admin/officers
```

**Backend API**:
```
https://civicpath-db.onrender.com/api/v1/complaints
https://civicpath-db.onrender.com/health
```

---

## Alternative: Use Subdomain Routing (Advanced)

If you want cleaner URLs, you can set up:
- `citizen.civicpath.com` → Citizen frontend
- `admin.civicpath.com` → Admin frontend
- `api.civicpath.com` → Backend

This requires a custom domain and DNS configuration.

---

## Testing Your Setup

### Test 1: Citizen Frontend
1. Go to `https://civicpath-frontend.onrender.com/citizen/report`
2. Submit a complaint
3. Should save to database

### Test 2: Admin Frontend
1. Go to `https://civicpath-admin.onrender.com/admin/complaints`
2. Should see the complaint you just submitted
3. Try adding an officer

### Test 3: Data Sync
1. Submit complaint from citizen frontend
2. View it in admin frontend
3. Both should show same data (same database)

---

## Environment Variables Summary

### Citizen Frontend Service
```
NEXT_PUBLIC_API_URL=https://civicpath-db.onrender.com
```

### Admin Frontend Service
```
NEXT_PUBLIC_API_URL=https://civicpath-db.onrender.com
```

### Backend Service
```
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
DB_HOST=<your-render-db-host>
DB_PORT=5432
DB_NAME=<your-db-name>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>

# Cloudinary
CLOUDINARY_CLOUD_NAME=dredol55o
CLOUDINARY_API_KEY=442391251121382
CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
USE_CLOUDINARY=true

# CORS - IMPORTANT: Include both frontends!
CORS_ORIGIN=https://civicpath-frontend.onrender.com,https://civicpath-admin.onrender.com,http://localhost:3000

# JWT
JWT_SECRET=your_long_random_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## Cost Considerations

**Free Tier Limits**:
- Each web service on free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (enough for 1 service running 24/7)

**With 2 Frontends + 1 Backend + 1 Database**:
- You'll use 3 web services
- Free tier: 750 hours total (not per service)
- Consider upgrading to paid plan ($7/month per service)

**Recommendation**:
- Keep backend on paid plan (always running)
- Keep frontends on free tier (acceptable cold start)
- Or use single frontend deployment with both citizen and admin pages

---

## Security Considerations

### Separate Deployments Benefits:
✅ Admin panel isolated from public site
✅ Can add authentication middleware to admin deployment
✅ Different scaling/caching strategies
✅ Easier to restrict admin access by IP

### Same Deployment Benefits:
✅ Lower cost (1 service instead of 2)
✅ Simpler deployment process
✅ Shared caching and resources
✅ Single URL to manage

---

## Recommended Approach

For your use case, I recommend:

### Option 1: Single Frontend (Simpler)
Deploy once, access different routes:
- `https://civicpath.onrender.com/citizen` - Public
- `https://civicpath.onrender.com/admin` - Admin

**Pros**: Simpler, cheaper, easier to maintain
**Cons**: Admin and citizen on same domain

### Option 2: Separate Frontends (More Secure)
Deploy twice:
- `https://civicpath-citizen.onrender.com` - Public
- `https://civicpath-admin.onrender.com` - Admin

**Pros**: Better security, isolated deployments
**Cons**: More complex, higher cost

---

## Quick Start Commands

### Deploy Admin Frontend Now

1. **Go to Render**: https://dashboard.render.com/
2. **Click**: New + → Web Service
3. **Connect**: Your GitHub repository
4. **Configure**:
   - Name: `civicpath-admin`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Environment: `NEXT_PUBLIC_API_URL=<your-backend-url>`
5. **Create**: Click "Create Web Service"
6. **Wait**: 5-10 minutes for deployment
7. **Access**: `https://civicpath-admin.onrender.com/admin/complaints`

---

## Troubleshooting

### Issue: Admin pages show 404
**Solution**: The admin pages are part of the same Next.js app, so they should work automatically. Just access `/admin/complaints` route.

### Issue: CORS error
**Solution**: Make sure backend `CORS_ORIGIN` includes the admin frontend URL.

### Issue: Can't connect to backend
**Solution**: Check `NEXT_PUBLIC_API_URL` is set correctly in admin frontend environment variables.

### Issue: Data not syncing
**Solution**: Both frontends should use the same backend URL. Verify environment variables.

---

## Final Checklist

- [ ] Admin frontend deployed on Render
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set
- [ ] Backend `CORS_ORIGIN` includes admin URL
- [ ] Can access admin pages
- [ ] Can view complaints
- [ ] Can add officers
- [ ] Data syncs between citizen and admin

---

**Ready to deploy?** Follow Step 2 above to create the admin frontend service!

**Need help?** Share your backend URL and I'll give you the exact configuration!
