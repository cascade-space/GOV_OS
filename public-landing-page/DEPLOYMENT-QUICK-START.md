# 🚀 CivicPath Deployment - Quick Start

## One-Page Deployment Guide

### Prerequisites
- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ Render account (free)
- ✅ Cloudinary already setup

---

## 1️⃣ Push to GitHub (2 minutes)

```cmd
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/civicpath.git
git push -u origin main
```

---

## 2️⃣ Deploy Frontend - Vercel (5 minutes)

1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repo
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://civicpath-api.onrender.com
   ```
5. Click "Deploy"
6. Copy your URL: `https://civicpath-xyz.vercel.app`

---

## 3️⃣ Deploy Backend - Render (10 minutes)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Select your repo
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   CLOUDINARY_CLOUD_NAME=dredol55o
   CLOUDINARY_API_KEY=442391251121382
   CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
   USE_CLOUDINARY=true
   JWT_SECRET=your_super_secret_key_min_32_chars
   CORS_ORIGIN=https://civicpath-xyz.vercel.app
   ```

6. Click "Create Web Service"
7. Copy your URL: `https://civicpath-api.onrender.com`

---

## 4️⃣ Setup Database - Render (5 minutes)

1. In Render, click "New +" → "PostgreSQL"
2. Name: `civicpath-db`
3. Click "Create Database"
4. Copy "Internal Database URL"
5. Update backend environment variables:
   ```
   DB_HOST=dpg-xxxxx.oregon-postgres.render.com
   DB_USER=civicpath_user
   DB_PASSWORD=your_password
   DB_NAME=civicpath
   DB_PORT=5432
   ```

6. Connect and run migrations:
   ```cmd
   psql postgresql://connection-string
   ```
   Then paste content from `database/schema.sql`

---

## 5️⃣ Update Frontend URL (2 minutes)

1. Go to Vercel → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to your Render backend URL
3. Redeploy

---

## ✅ Test Everything

1. Visit: `https://civicpath-api.onrender.com/health`
2. Visit: `https://civicpath-xyz.vercel.app`
3. Submit a test complaint
4. Check Cloudinary for uploaded image

---

## 🎉 Done!

Your app is live:
- **Frontend**: https://civicpath-xyz.vercel.app
- **Backend**: https://civicpath-api.onrender.com
- **Cost**: $0 for 90 days, then $7/month

---

## 🔥 Pro Tips

1. **Keep backend awake**: Use UptimeRobot.com (free)
2. **Custom domain**: Add in Vercel/Render settings
3. **Monitor**: Check Render logs regularly
4. **Backup**: Database backups available on paid plan

---

## 🆘 Quick Fixes

**Backend sleeping?**
- Free tier sleeps after 15 min
- First request takes 30-60 sec
- Use UptimeRobot or upgrade

**CORS error?**
- Check CORS_ORIGIN matches Vercel URL
- Include https://

**Database error?**
- Verify connection string
- Check database is running
- Run migrations again

---

## 📚 Full Guide

For detailed step-by-step instructions, see:
- `DEPLOY-STEP-BY-STEP.md` - Complete walkthrough
- `DEPLOYMENT-GUIDE.md` - Architecture and options

---

## Cost Breakdown

| Service | Free Tier | After 90 Days |
|---------|-----------|---------------|
| Vercel | ✅ Free | Free |
| Render Backend | ✅ Free | Free |
| Render Database | ✅ Free | $7/month |
| Cloudinary | ✅ Free | Free |
| **Total** | **$0** | **$7/month** |

---

## Your Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Database created on Render
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Frontend URL updated
- [ ] Health check passes
- [ ] Test complaint submitted
- [ ] Image uploaded to Cloudinary
- [ ] All portals accessible

---

## Share Your App

Once deployed, share these URLs:

- **Citizens**: `https://your-app.vercel.app`
- **Officers**: `https://your-app.vercel.app/officer`
- **Admin**: `https://your-app.vercel.app/admin`
- **MLA**: `https://your-app.vercel.app/mla`

---

**Need help?** Check the full guides or Render/Vercel documentation.

**Ready to deploy?** Start with Step 1! 🚀
