# CivicPath Deployment - Complete Step-by-Step Guide

## 🎯 Goal
Deploy your CivicPath application to production:
- Frontend → Vercel (Free)
- Backend → Render (Free)
- Database → Render PostgreSQL (Free for 90 days)
- Images → Cloudinary (Already setup ✅)

## ⏱️ Time Required
- Total: 30-45 minutes
- GitHub setup: 5 minutes
- Frontend deployment: 10 minutes
- Backend deployment: 15 minutes
- Database setup: 10 minutes
- Testing: 5 minutes

---

## STEP 1: Prepare Your Code (5 minutes)

### 1.1 Create GitHub Repository
1. Go to https://github.com
2. Click "New repository" (green button)
3. Name: `civicpath` (or any name you like)
4. Keep it Public or Private (your choice)
5. DON'T check "Initialize with README"
6. Click "Create repository"

### 1.2 Push Your Code to GitHub

Open Command Prompt in your project folder and run:

```cmd
git init
git add .
git commit -m "Initial commit - CivicPath ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/civicpath.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

✅ **Checkpoint**: Your code is now on GitHub!

---

## STEP 2: Deploy Frontend to Vercel (10 minutes)

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### 2.2 Import Your Project
1. Click "Add New..." → "Project"
2. Find your `civicpath` repository
3. Click "Import"

### 2.3 Configure Build Settings
Vercel auto-detects Next.js, but verify:
- Framework Preset: `Next.js`
- Root Directory: `./` (leave as is)
- Build Command: `npm run build`
- Output Directory: `.next`

### 2.4 Add Environment Variables
Click "Environment Variables" and add:

```
Name: NEXT_PUBLIC_API_URL
Value: https://civicpath-api.onrender.com
```

(We'll update this URL after deploying backend)

### 2.5 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. You'll see "Congratulations!" 🎉

### 2.6 Get Your Frontend URL
Copy your URL, it will be something like:
```
https://civicpath-abc123.vercel.app
```

✅ **Checkpoint**: Frontend is live! (But won't work yet without backend)

---

## STEP 3: Deploy Backend to Render (15 minutes)

### 3.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started"
3. Choose "Continue with GitHub"
4. Authorize Render to access your GitHub

### 3.2 Create Web Service
1. Click "New +" → "Web Service"
2. Find your `civicpath` repository
3. Click "Connect"

### 3.3 Configure Service
Fill in these settings:

- **Name**: `civicpath-api` (or any name)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 3.4 Add Environment Variables
Click "Advanced" → "Add Environment Variable"

Add these one by one:

```
NODE_ENV = production
PORT = 5000
API_VERSION = v1

# Database (we'll update these after creating database)
DB_HOST = (leave empty for now)
DB_PORT = 5432
DB_NAME = civicpath
DB_USER = (leave empty for now)
DB_PASSWORD = (leave empty for now)
DB_POOL_MIN = 2
DB_POOL_MAX = 10

# JWT
JWT_SECRET = your_super_secret_production_key_min_32_characters_long_change_this
JWT_EXPIRES_IN = 7d

# Cloudinary (your existing credentials)
CLOUDINARY_CLOUD_NAME = dredol55o
CLOUDINARY_API_KEY = 442391251121382
CLOUDINARY_API_SECRET = DzIRRoSb3yDkxbqX1nmnI9OKqWE
USE_CLOUDINARY = true

# CORS (your Vercel URL from Step 2.6)
CORS_ORIGIN = https://civicpath-abc123.vercel.app
CORS_CREDENTIALS = true

# Logging
LOG_LEVEL = info

# File Upload
MAX_FILE_SIZE = 5242880
ALLOWED_FILE_TYPES = image/jpeg,image/png,image/jpg,application/pdf
```

### 3.5 Deploy Backend
1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. You'll see "Live" status

### 3.6 Get Your Backend URL
Copy your URL, it will be something like:
```
https://civicpath-api.onrender.com
```

✅ **Checkpoint**: Backend is deployed! (But needs database)

---

## STEP 4: Setup Database on Render (10 minutes)

### 4.1 Create PostgreSQL Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Fill in:
   - **Name**: `civicpath-db`
   - **Database**: `civicpath`
   - **User**: `civicpath_user` (auto-generated)
   - **Region**: Same as your backend
   - **PostgreSQL Version**: 15 (or latest)
   - **Instance Type**: `Free`

3. Click "Create Database"
4. Wait 2-3 minutes

### 4.2 Get Database Connection Details
After creation, you'll see:
- **Internal Database URL**: Use this for backend
- **External Database URL**: Use this for local connections

Copy the "Internal Database URL", it looks like:
```
postgresql://civicpath_user:password@dpg-xxxxx/civicpath
```

### 4.3 Update Backend Environment Variables
1. Go back to your backend service
2. Click "Environment" tab
3. Update these variables:

Extract from your database URL:
```
DB_HOST = dpg-xxxxx-a.oregon-postgres.render.com
DB_USER = civicpath_user
DB_PASSWORD = (the password from URL)
```

4. Click "Save Changes"
5. Backend will automatically redeploy (2-3 minutes)

### 4.4 Run Database Migrations
1. In Render database dashboard, click "Connect" → "External Connection"
2. Copy the `psql` command
3. Open Command Prompt and paste it:

```cmd
psql postgresql://civicpath_user:password@dpg-xxxxx/civicpath
```

4. Once connected, run your schema:

```sql
-- Copy and paste content from database/schema.sql
-- Then press Enter
```

5. Optionally run seed data:

```sql
-- Copy and paste content from database/seed-data.sql
-- Then press Enter
```

6. Verify tables created:

```sql
\dt
```

You should see: complaints, complaint_attachments, complaint_history, users, etc.

7. Exit:

```sql
\q
```

✅ **Checkpoint**: Database is setup and connected!

---

## STEP 5: Update Frontend API URL (2 minutes)

### 5.1 Update Vercel Environment Variable
1. Go to Vercel dashboard
2. Select your project
3. Click "Settings" → "Environment Variables"
4. Find `NEXT_PUBLIC_API_URL`
5. Click "Edit"
6. Update value to your Render backend URL:
   ```
   https://civicpath-api.onrender.com
   ```
7. Click "Save"

### 5.2 Redeploy Frontend
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 2 minutes

✅ **Checkpoint**: Frontend now connected to backend!

---

## STEP 6: Test Your Deployment (5 minutes)

### 6.1 Test Backend Health
Open browser and visit:
```
https://civicpath-api.onrender.com/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-..."
}
```

### 6.2 Test Frontend
Open your Vercel URL:
```
https://civicpath-abc123.vercel.app
```

### 6.3 Test Complete Flow
1. Go to citizen portal
2. Click "Report Issue"
3. Fill in complaint details
4. Upload an image
5. Submit

6. Check if complaint appears in database:
```cmd
psql postgresql://your-connection-string
SELECT * FROM complaints;
\q
```

7. Check Cloudinary:
   - Go to https://cloudinary.com
   - Login
   - Go to Media Library
   - You should see the uploaded image with citizen name

✅ **Checkpoint**: Everything works end-to-end!

---

## 🎉 Deployment Complete!

Your CivicPath application is now live:

- **Frontend**: https://civicpath-abc123.vercel.app
- **Backend**: https://civicpath-api.onrender.com
- **Database**: Render PostgreSQL
- **Images**: Cloudinary

## 📊 What You're Using

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Free | $0 | Unlimited bandwidth |
| Render Backend | Free | $0 | 750 hours/month |
| Render Database | Free | $0 | 90 days, then $7/month |
| Cloudinary | Free | $0 | 25GB storage |

**Total Cost**: $0 for 90 days, then $7/month

## 🔧 Important Notes

### Free Tier Limitations

1. **Render Free Tier**:
   - Backend sleeps after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds
   - 750 hours/month (enough for 1 service running 24/7)

2. **Database Free Tier**:
   - Free for 90 days
   - After 90 days: $7/month
   - 1GB storage
   - 97 connections max

3. **Cloudinary Free Tier**:
   - 25GB storage
   - 25GB bandwidth/month
   - Should be enough for small-medium usage

### Keeping Backend Awake

To prevent backend from sleeping, you can:

1. Use a service like UptimeRobot (free):
   - Go to https://uptimerobot.com
   - Add monitor for your backend URL
   - Ping every 5 minutes

2. Or upgrade to Render paid plan ($7/month)

## 🚀 Next Steps

1. **Custom Domain** (Optional):
   - Buy domain from Namecheap/GoDaddy
   - Add to Vercel: `civicpath.com`
   - Add to Render: `api.civicpath.com`

2. **Monitoring**:
   - Enable Vercel Analytics
   - Check Render logs regularly
   - Monitor Cloudinary usage

3. **Backups**:
   - Database: Render provides backups (paid plan)
   - Code: Already on GitHub
   - Images: Cloudinary has backups

4. **Security**:
   - Change JWT_SECRET to a strong random string
   - Enable 2FA on all accounts
   - Regularly update dependencies

## 🆘 Troubleshooting

### Frontend shows "Failed to fetch"
- Check CORS_ORIGIN in backend includes your Vercel URL
- Check NEXT_PUBLIC_API_URL in Vercel environment variables
- Check backend is running (visit /health endpoint)

### Backend shows "Database connection failed"
- Verify DB_HOST, DB_USER, DB_PASSWORD in Render
- Check database is running in Render dashboard
- Try connecting with psql from command line

### Images not uploading
- Verify Cloudinary credentials in Render environment
- Check USE_CLOUDINARY=true
- Test Cloudinary connection in backend logs

### Backend is slow
- Free tier sleeps after 15 minutes
- First request wakes it up (30-60 seconds)
- Use UptimeRobot to keep it awake
- Or upgrade to paid plan

## 📞 Support

- **Vercel**: https://vercel.com/docs
- **Render**: https://render.com/docs
- **Cloudinary**: https://cloudinary.com/documentation

---

## Summary

✅ Code pushed to GitHub
✅ Frontend deployed to Vercel
✅ Backend deployed to Render
✅ Database setup on Render
✅ Cloudinary connected
✅ Everything tested and working

Your CivicPath application is now live and accessible worldwide! 🌍

Share your URLs:
- Citizens: `https://civicpath-abc123.vercel.app`
- Officers: `https://civicpath-abc123.vercel.app/officer`
- Admin: `https://civicpath-abc123.vercel.app/admin`
- MLA: `https://civicpath-abc123.vercel.app/mla`
