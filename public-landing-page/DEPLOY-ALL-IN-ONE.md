# 🎯 Deploy CivicPath - All-in-One Platform

## Best Options for Single Platform Hosting

### Option 1: Render (Recommended) ⭐
**Host everything on Render.com**

**What you get:**
- ✅ Frontend (Next.js)
- ✅ Backend (Node.js)
- ✅ Database (PostgreSQL)
- ✅ Single dashboard
- ✅ Easy management

**Cost:**
- Free for 90 days
- After 90 days: $14/month ($7 backend + $7 database)
- Frontend is free forever

**Pros:**
- Everything in one place
- Single login
- Easy to manage
- Good free tier
- Automatic HTTPS

**Cons:**
- Free tier services sleep after 15 min inactivity
- Slower than Vercel for frontend

---

### Option 2: Railway.app ⭐
**Host everything on Railway.app**

**What you get:**
- ✅ Frontend (Next.js)
- ✅ Backend (Node.js)
- ✅ Database (PostgreSQL)
- ✅ $5 free credit/month

**Cost:**
- $5 free credit/month (enough for small apps)
- Pay only for what you use
- ~$10-15/month after free credit

**Pros:**
- Modern interface
- Very easy to use
- No sleep on free tier
- Fast deployments
- Great developer experience

**Cons:**
- Free credit runs out
- Can get expensive with high traffic

---

### Option 3: DigitalOcean App Platform
**Host everything on DigitalOcean**

**What you get:**
- ✅ Frontend (Next.js)
- ✅ Backend (Node.js)
- ✅ Database (PostgreSQL)

**Cost:**
- No free tier
- Starts at $12/month (app) + $15/month (database)
- Total: ~$27/month

**Pros:**
- Professional grade
- No sleep
- Fast performance
- Good for production

**Cons:**
- No free tier
- More expensive
- Requires credit card

---

### Option 4: Fly.io
**Host everything on Fly.io**

**What you get:**
- ✅ Frontend (Next.js)
- ✅ Backend (Node.js)
- ✅ Database (PostgreSQL)

**Cost:**
- Free tier: 3 VMs, 3GB storage
- Enough for small apps
- ~$10-15/month for larger apps

**Pros:**
- Good free tier
- Fast global network
- No sleep
- Modern platform

**Cons:**
- Slightly complex setup
- Learning curve

---

## 🏆 My Recommendation: Render

For your use case, I recommend **Render** because:

1. **Easiest to setup** - Just connect GitHub
2. **Free for 90 days** - Test before paying
3. **All in one dashboard** - Manage everything
4. **Good documentation** - Easy to follow
5. **Affordable** - Only $14/month after trial

---

## 🚀 Deploy to Render - Complete Guide

### Time Required: 20 minutes

---

## STEP 1: Create Render Account (2 minutes)

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render

---

## STEP 2: Push Code to GitHub (2 minutes)

```cmd
git init
git add .
git commit -m "Ready for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/civicpath.git
git push -u origin main
```

---

## STEP 3: Deploy Backend (5 minutes)

### 3.1 Create Web Service
1. In Render dashboard, click "New +" → "Web Service"
2. Click "Connect a repository"
3. Select your `civicpath` repo
4. Click "Connect"

### 3.2 Configure Backend
- **Name**: `civicpath-backend`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 3.3 Add Environment Variables

**EASY METHOD - Bulk Import:**
1. Click "Advanced" → "Add from .env"
2. Open file: `backend/.env.render`
3. Copy entire content
4. Paste into Render
5. Click "Save"

**OR Manual Method:**
Click "Advanced" and add one by one:

```env
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database (we'll update after creating DB)
DB_HOST=
DB_PORT=5432
DB_NAME=civicpath
DB_USER=
DB_PASSWORD=
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT (CHANGE THIS!)
JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_PLUS_CHARACTERS_STRING
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=dredol55o
CLOUDINARY_API_KEY=442391251121382
CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
USE_CLOUDINARY=true

# CORS (we'll update after deploying frontend)
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf
```

**📝 Note**: All these variables are pre-configured in `backend/.env.render` for easy import!

### 3.4 Deploy
1. Click "Create Web Service"
2. Wait 3-5 minutes
3. Copy your backend URL: `https://civicpath-backend.onrender.com`

---

## STEP 4: Deploy Frontend (5 minutes)

### 4.1 Create Static Site
1. Click "New +" → "Static Site"
2. Select your `civicpath` repo
3. Click "Connect"

### 4.2 Configure Frontend
- **Name**: `civicpath`
- **Branch**: `main`
- **Root Directory**: `./` (leave empty)
- **Build Command**: `npm run build`
- **Publish Directory**: `out`

### 4.3 Add Environment Variable
Click "Advanced" and add:

```env
NEXT_PUBLIC_API_URL=https://civicpath-backend.onrender.com
```

### 4.4 Update next.config.js
You need to enable static export. Create/update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

Commit and push:
```cmd
git add next.config.js
git commit -m "Enable static export for Render"
git push
```

### 4.5 Deploy
1. Click "Create Static Site"
2. Wait 3-5 minutes
3. Copy your frontend URL: `https://civicpath.onrender.com`

---

## STEP 5: Create Database (5 minutes)

### 5.1 Create PostgreSQL
1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `civicpath-db`
   - **Database**: `civicpath`
   - **User**: `civicpath_user` (auto-generated)
   - **Region**: Same as backend
   - **PostgreSQL Version**: 15
   - **Instance Type**: `Free`

3. Click "Create Database"
4. Wait 2-3 minutes

### 5.2 Get Connection Details
After creation, you'll see:
- **Internal Database URL**: Copy this

Example:
```
postgresql://civicpath_user:abc123@dpg-xxxxx/civicpath
```

Extract these values:
- **Host**: `dpg-xxxxx-a.oregon-postgres.render.com`
- **User**: `civicpath_user`
- **Password**: `abc123`
- **Database**: `civicpath`

### 5.3 Update Backend Environment
1. Go to your backend service
2. Click "Environment"
3. Update these variables:

```env
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_USER=civicpath_user
DB_PASSWORD=abc123
```

4. Also update CORS_ORIGIN:
```env
CORS_ORIGIN=https://civicpath.onrender.com
```

5. Click "Save Changes"
6. Backend will redeploy automatically

---

## STEP 6: Setup Database Schema (3 minutes)

### 6.1 Connect to Database
In Render database dashboard:
1. Click "Connect" → "External Connection"
2. Copy the `psql` command
3. Open Command Prompt and paste:

```cmd
psql postgresql://civicpath_user:password@dpg-xxxxx/civicpath
```

### 6.2 Run Migrations
Once connected, copy and paste content from `database/schema.sql`:

```sql
-- Paste entire schema.sql content here
-- Press Enter
```

### 6.3 Verify Tables
```sql
\dt
```

You should see all tables: complaints, users, complaint_attachments, etc.

### 6.4 Optional: Add Seed Data
```sql
-- Paste content from database/seed-data.sql
```

### 6.5 Exit
```sql
\q
```

---

## STEP 7: Test Everything (2 minutes)

### 7.1 Test Backend
Visit: `https://civicpath-backend.onrender.com/health`

Should see:
```json
{"status": "OK"}
```

### 7.2 Test Frontend
Visit: `https://civicpath.onrender.com`

### 7.3 Test Complete Flow
1. Go to citizen portal
2. Click "Report Issue"
3. Fill in details
4. Upload image
5. Submit

6. Check Cloudinary:
   - Login to cloudinary.com
   - Go to Media Library
   - Image should be there with citizen name

---

## ✅ Deployment Complete!

Everything is now on Render:

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://civicpath.onrender.com | ✅ Live |
| Backend | https://civicpath-backend.onrender.com | ✅ Live |
| Database | Internal (Render PostgreSQL) | ✅ Live |
| Images | Cloudinary | ✅ Live |

---

## 💰 Cost Breakdown

| Service | Free Tier | After 90 Days |
|---------|-----------|---------------|
| Frontend | ✅ Free forever | Free |
| Backend | ✅ Free (with sleep) | $7/month |
| Database | ✅ Free for 90 days | $7/month |
| Cloudinary | ✅ Free | Free |
| **Total** | **$0** | **$14/month** |

---

## ⚠️ Important Notes

### Free Tier Limitations

1. **Backend sleeps after 15 minutes** of inactivity
   - First request takes 30-60 seconds to wake up
   - Subsequent requests are fast

2. **Database free for 90 days**
   - After 90 days: $7/month
   - 1GB storage
   - 97 connections

3. **To keep backend awake** (optional):
   - Use UptimeRobot.com (free)
   - Ping your backend every 5 minutes
   - Or upgrade to paid plan ($7/month)

---

## 🎯 Advantages of All-in-One on Render

✅ **Single Dashboard**: Manage everything in one place
✅ **Easy Setup**: Just connect GitHub
✅ **Automatic Deploys**: Push to GitHub = auto deploy
✅ **Free Tier**: Test for 90 days free
✅ **Affordable**: Only $14/month after trial
✅ **HTTPS**: Automatic SSL certificates
✅ **Logs**: View all logs in one place
✅ **Environment Variables**: Easy to manage
✅ **Backups**: Database backups available
✅ **Monitoring**: Built-in monitoring

---

## 🔧 Managing Your App

### View Logs
1. Go to Render dashboard
2. Click on service (frontend/backend)
3. Click "Logs" tab
4. See real-time logs

### Update Environment Variables
1. Click on service
2. Click "Environment" tab
3. Edit variables
4. Click "Save" (auto-redeploys)

### Redeploy
1. Click on service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Or push to GitHub (auto-deploys)

### View Database
1. Click on database
2. Click "Connect" → "External Connection"
3. Use psql or pgAdmin

---

## 🚀 Next Steps

1. **Custom Domain** (Optional):
   - Buy domain from Namecheap
   - Add to Render: `civicpath.com`
   - Update DNS records

2. **Keep Backend Awake**:
   - Sign up at UptimeRobot.com
   - Add monitor for backend URL
   - Ping every 5 minutes

3. **Monitor Usage**:
   - Check Render dashboard regularly
   - Monitor Cloudinary usage
   - Check database size

4. **Upgrade When Needed**:
   - If backend sleep is annoying → $7/month
   - After 90 days → $7/month for database
   - Total: $14/month for no sleep + database

---

## 🆘 Troubleshooting

### Frontend not loading
- Check build logs in Render
- Verify `next.config.js` has `output: 'export'`
- Check environment variables

### Backend not responding
- Check if it's sleeping (first request slow)
- View logs in Render dashboard
- Verify database connection

### Database connection failed
- Check DB_HOST, DB_USER, DB_PASSWORD
- Verify database is running
- Check internal database URL

### Images not uploading
- Verify Cloudinary credentials
- Check USE_CLOUDINARY=true
- View backend logs for errors

---

## 📊 Comparison: Split vs All-in-One

| Aspect | Vercel + Render | All on Render |
|--------|-----------------|---------------|
| Setup Complexity | Medium | Easy |
| Management | 2 dashboards | 1 dashboard |
| Frontend Speed | Faster (Vercel CDN) | Good |
| Cost (90 days) | $0 | $0 |
| Cost (after) | $7/month | $14/month |
| Free Tier | Better | Good |

**Recommendation**: 
- **All on Render** if you want simplicity
- **Vercel + Render** if you want faster frontend

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## Summary

✅ Everything hosted on Render
✅ Single dashboard to manage
✅ Free for 90 days
✅ $14/month after trial
✅ Easy to setup and maintain
✅ Automatic deployments
✅ HTTPS included
✅ Cloudinary for images

Your CivicPath app is now live on a single platform! 🎉

**Your URLs:**
- Frontend: `https://civicpath.onrender.com`
- Backend: `https://civicpath-backend.onrender.com`
- All portals accessible from frontend URL

Share with users:
- Citizens: `https://civicpath.onrender.com`
- Officers: `https://civicpath.onrender.com/officer`
- Admin: `https://civicpath.onrender.com/admin`
- MLA: `https://civicpath.onrender.com/mla`
