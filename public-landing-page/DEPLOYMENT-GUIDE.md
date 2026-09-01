# CivicPath Deployment Guide

## Overview

Your CivicPath application has two parts:
1. **Frontend** (Next.js) → Deploy to **Vercel** ✅
2. **Backend** (Node.js/Express) → Deploy to **Render** ✅
3. **Database** (PostgreSQL) → Use **Render PostgreSQL** or **Supabase** ✅
4. **Images** (Cloudinary) → Already cloud-based ✅

## Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Frontend (Next.js)                             │
│  Hosted on: Vercel                              │
│  URL: https://civicpath.vercel.app              │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ API Calls
                 ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  Backend (Node.js/Express)                      │
│  Hosted on: Render                              │
│  URL: https://civicpath-api.onrender.com        │
│                                                 │
└────────┬──────────────────────┬─────────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌────────────────┐    ┌────────────────────┐
│   PostgreSQL   │    │    Cloudinary      │
│   Database     │    │    (Images)        │
│   on Render    │    │    Already Setup   │
└────────────────┘    └────────────────────┘
```

## Deployment Options

### Option 1: Vercel + Render (Recommended)
- ✅ Frontend on Vercel (Free)
- ✅ Backend on Render (Free tier available)
- ✅ Database on Render PostgreSQL (Free tier)
- ✅ Images on Cloudinary (Already setup)

### Option 2: All on Render
- ✅ Frontend on Render
- ✅ Backend on Render
- ✅ Database on Render
- ✅ Images on Cloudinary

### Option 3: Vercel + Railway
- ✅ Frontend on Vercel
- ✅ Backend on Railway
- ✅ Database on Railway
- ✅ Images on Cloudinary

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Vercel** (Frontend) | ✅ Unlimited | $20/month |
| **Render** (Backend) | ✅ 750 hours/month | $7/month |
| **Render** (Database) | ✅ 90 days free | $7/month |
| **Cloudinary** (Images) | ✅ 25GB storage | $89/month |

**Total Free Tier**: $0/month for 90 days, then $7/month for database

## Prerequisites

Before deploying, you need:
- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ Render account (free)
- ✅ Cloudinary account (already have)
- ✅ Your code pushed to GitHub

## Step-by-Step Deployment

See detailed guides:
1. `DEPLOY-FRONTEND-VERCEL.md` - Deploy Next.js to Vercel
2. `DEPLOY-BACKEND-RENDER.md` - Deploy Node.js to Render
3. `DEPLOY-DATABASE-RENDER.md` - Setup PostgreSQL on Render

## Quick Start

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/civicpath.git
git push -u origin main
```

### 2. Deploy Frontend to Vercel
1. Go to: https://vercel.com
2. Click "Import Project"
3. Select your GitHub repo
4. Vercel auto-detects Next.js
5. Click "Deploy"
6. Done! ✅

### 3. Deploy Backend to Render
1. Go to: https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Select `backend` folder
5. Add environment variables
6. Click "Create Web Service"
7. Done! ✅

### 4. Setup Database on Render
1. In Render dashboard
2. Click "New +" → "PostgreSQL"
3. Name: `civicpath-db`
4. Click "Create Database"
5. Copy connection string
6. Add to backend environment variables
7. Done! ✅

## Environment Variables

### Frontend (.env.local on Vercel)
```env
NEXT_PUBLIC_API_URL=https://civicpath-api.onrender.com
```

### Backend (Environment on Render)
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-render-db-host
DB_PORT=5432
DB_NAME=civicpath
DB_USER=your-db-user
DB_PASSWORD=your-db-password
CLOUDINARY_CLOUD_NAME=dredol55o
CLOUDINARY_API_KEY=442391251121382
CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
USE_CLOUDINARY=true
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://civicpath.vercel.app
```

## Database Migration

After deploying database, run migrations:
```bash
# Connect to Render PostgreSQL
psql postgresql://user:pass@host:5432/civicpath

# Run schema
\i database/schema.sql

# Run seed data (optional)
\i database/seed-data.sql
```

## Testing Deployment

### Test Frontend
```bash
curl https://civicpath.vercel.app
```

### Test Backend
```bash
curl https://civicpath-api.onrender.com/health
```

### Test API Connection
```bash
curl https://civicpath-api.onrender.com/api/v1/complaints
```

## Custom Domain (Optional)

### For Frontend (Vercel)
1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain: `civicpath.com`
4. Update DNS records
5. Done!

### For Backend (Render)
1. Go to Render service settings
2. Click "Custom Domain"
3. Add: `api.civicpath.com`
4. Update DNS records
5. Done!

## Monitoring

### Vercel Analytics
- Built-in analytics
- View at: https://vercel.com/analytics

### Render Logs
- View logs in Render dashboard
- Real-time log streaming

### Database Monitoring
- Render provides database metrics
- Connection count, storage, etc.

## Scaling

### Free Tier Limits
- **Vercel**: Unlimited bandwidth
- **Render**: 750 hours/month (enough for 1 service)
- **Database**: 1GB storage, 97 connections

### When to Upgrade
- More than 100 concurrent users → Upgrade Render
- More than 1GB database → Upgrade database
- Need faster builds → Upgrade Vercel

## Troubleshooting

### Frontend not loading
- Check Vercel deployment logs
- Verify API_URL environment variable
- Check CORS settings in backend

### Backend not responding
- Check Render service logs
- Verify environment variables
- Check database connection

### Database connection failed
- Verify connection string
- Check database is running
- Verify IP whitelist (Render auto-whitelists)

### Images not uploading
- Verify Cloudinary credentials
- Check USE_CLOUDINARY=true
- Test Cloudinary connection

## Backup Strategy

### Database Backups
- Render: Automatic daily backups (paid plan)
- Manual: Export using pg_dump
```bash
pg_dump postgresql://user:pass@host:5432/civicpath > backup.sql
```

### Code Backups
- GitHub: Automatic version control
- Push regularly to GitHub

### Images Backups
- Cloudinary: Automatic backups
- Download from media library if needed

## Security Checklist

- ✅ Use environment variables for secrets
- ✅ Enable HTTPS (automatic on Vercel/Render)
- ✅ Set strong JWT_SECRET
- ✅ Configure CORS properly
- ✅ Use strong database password
- ✅ Keep dependencies updated
- ✅ Enable rate limiting
- ✅ Sanitize user inputs

## Performance Optimization

### Frontend
- ✅ Next.js automatic optimization
- ✅ Image optimization with next/image
- ✅ Code splitting
- ✅ CDN delivery (Vercel Edge Network)

### Backend
- ✅ Database connection pooling
- ✅ Cloudinary CDN for images
- ✅ Gzip compression
- ✅ Caching headers

### Database
- ✅ Indexes on frequently queried columns
- ✅ Connection pooling
- ✅ Query optimization

## Cost Estimation

### Small Scale (< 1000 users)
- Frontend: $0 (Vercel free)
- Backend: $0 (Render free tier)
- Database: $7/month (after 90 days)
- Images: $0 (Cloudinary free)
**Total: $7/month**

### Medium Scale (1000-10000 users)
- Frontend: $20/month (Vercel Pro)
- Backend: $7/month (Render Starter)
- Database: $7/month (Render Starter)
- Images: $0 (Cloudinary free)
**Total: $34/month**

### Large Scale (10000+ users)
- Frontend: $20/month (Vercel Pro)
- Backend: $25/month (Render Standard)
- Database: $20/month (Render Standard)
- Images: $89/month (Cloudinary Plus)
**Total: $154/month**

## Next Steps

1. Read: `DEPLOY-FRONTEND-VERCEL.md`
2. Read: `DEPLOY-BACKEND-RENDER.md`
3. Read: `DEPLOY-DATABASE-RENDER.md`
4. Push code to GitHub
5. Deploy frontend to Vercel
6. Deploy backend to Render
7. Setup database on Render
8. Test everything
9. Go live! 🚀

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

## Summary

✅ **Yes, you can deploy on Vercel + Render!**
✅ **Free tier available for testing**
✅ **Easy deployment process**
✅ **Scalable as you grow**
✅ **Cloudinary already cloud-based**

Your CivicPath app is ready for production! 🎉
