# CivicPath Complete Setup Guide

## 🎯 Overview

This guide will help you set up the complete CivicPath system from scratch:
1. PostgreSQL Database
2. Backend API Server
3. Frontend Next.js Application

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ installed
- Git (optional)
- Code editor (VS Code recommended)

---

## Part 1: Database Setup (15 minutes)

### Step 1: Install PostgreSQL

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer, set password for `postgres` user
3. Default port: 5432

**Verify installation:**
```cmd
psql --version
```

### Step 2: Create Database

```cmd
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE civicpath;

# Create user (optional but recommended)
CREATE USER civicpath_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE civicpath TO civicpath_user;

# Connect to database
\c civicpath

# Exit
\q
```

### Step 3: Load Schema

```cmd
cd database
psql -U postgres -d civicpath -f schema.sql
```

### Step 4: Load Sample Data

```cmd
psql -U postgres -d civicpath -f seed-data.sql
```

### Step 5: Verify

```cmd
psql -U postgres -d civicpath

# Check tables
\dt

# Check data
SELECT COUNT(*) FROM complaints;
SELECT COUNT(*) FROM users;

\q
```

✅ **Database setup complete!**

---

## Part 2: Backend API Setup (10 minutes)

### Step 1: Navigate to Backend

```cmd
cd backend
```

### Step 2: Install Dependencies

```cmd
npm install
```

This will install:
- Express.js (web framework)
- PostgreSQL driver (pg)
- Socket.io (real-time)
- And more...

### Step 3: Configure Environment

```cmd
# Copy example file
copy .env.example .env
```

Edit `.env` file:
```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secret_key_at_least_32_characters_long
```

### Step 4: Start Backend Server

```cmd
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

### Step 5: Test Backend

Open browser: http://localhost:5000

You should see:
```json
{
  "message": "CivicPath API Server Running",
  "version": "v1",
  "status": "healthy"
}
```

✅ **Backend setup complete!**

---

## Part 3: Frontend Setup (5 minutes)

### Step 1: Navigate to Project Root

```cmd
cd ..
```

### Step 2: Install Frontend Dependencies (if not already done)

```cmd
npm install
```

### Step 3: Update API URL

The frontend is already configured to use `http://localhost:5000/api/v1`

Check `src/lib/api-client.ts`:
```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
```

### Step 4: Start Frontend Portals

**Option A: Start All Portals**
```cmd
# Double-click this file:
run-all-portals.bat
```

**Option B: Start Individual Portals**
```cmd
# Citizen portal (port 3000)
npm run dev

# Officer portal (port 3001)
npm run dev:officer

# MLA portal (port 3003)
npm run dev:mla
```

✅ **Frontend setup complete!**

---

## Part 4: Testing the Complete System

### Test 1: Submit a Complaint

1. Open: http://localhost:3000/citizen/report
2. Fill in the form:
   - Title: "Test pothole on Main Street"
   - Description: "Large pothole causing issues for vehicles"
   - Category: Roads & Infrastructure
   - Sub-category: Potholes
   - Priority: High
   - Location: Click on map or use current location
   - Photos: Upload (optional)
   - Contact: Your name and mobile
   - Accept terms and conditions
3. Click "Submit Complaint"
4. Note the Complaint ID (e.g., CMP-2024-00006)

### Test 2: Verify in Database

```cmd
psql -U postgres -d civicpath

SELECT complaint_number, title, status FROM complaints ORDER BY created_at DESC LIMIT 1;
```

You should see your complaint!

### Test 3: Track Complaint

1. Open: http://localhost:3000/citizen/track
2. Enter the Complaint ID
3. Click "Track"
4. You should see your complaint details

### Test 4: Officer Portal

1. Open: http://localhost:3001/officer/dashboard
2. You should see the list of complaints
3. Click on your complaint
4. Try updating the status

### Test 5: Admin Portal

1. Open: http://localhost:3002/admin/login
2. Login with: admin / admin123
3. View dashboard statistics
4. Assign complaints to officers

### Test 6: MLA Portal

1. Open: http://localhost:3003/mla/dashboard
2. View constituency statistics
3. See all issues
4. Issue directives

---

## 🎉 Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `civicpath` created
- [ ] Schema loaded (15+ tables)
- [ ] Sample data loaded
- [ ] Backend server running on port 5000
- [ ] Backend API responding at http://localhost:5000
- [ ] Frontend portals running
- [ ] Can submit complaint from citizen portal
- [ ] Complaint appears in database
- [ ] Can track complaint
- [ ] Officer portal shows complaints
- [ ] Admin portal accessible
- [ ] MLA portal accessible

---

## 🔧 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browsers                         │
└───────────┬─────────────────────────────────────────────┘
            │
            │ HTTP Requests
            │
┌───────────▼─────────────────────────────────────────────┐
│              Next.js Frontend (Ports 3000-3003)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Citizen  │  │ Officer  │  │   MLA    │             │
│  │  Portal  │  │  Portal  │  │  Portal  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└───────────┬─────────────────────────────────────────────┘
            │
            │ REST API Calls
            │ WebSocket (Socket.io)
            │
┌───────────▼─────────────────────────────────────────────┐
│           Express.js Backend API (Port 5000)            │
│  ┌────────────────────────────────────────────────┐    │
│  │  Routes → Controllers → Database Queries       │    │
│  │  + Real-time notifications (Socket.io)         │    │
│  └────────────────────────────────────────────────┘    │
└───────────┬─────────────────────────────────────────────┘
            │
            │ SQL Queries
            │
┌───────────▼─────────────────────────────────────────────┐
│           PostgreSQL Database (Port 5432)               │
│  ┌────────────────────────────────────────────────┐    │
│  │  Tables: complaints, users, officers, etc.     │    │
│  │  Views, Functions, Triggers                    │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Error:** "Database connection failed"

**Solution:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Test connection: `psql -U postgres -d civicpath`

---

### Issue: Frontend shows "Network Error"

**Solution:**
1. Make sure backend is running on port 5000
2. Check http://localhost:5000 in browser
3. Check browser console for errors

---

### Issue: Complaint not appearing in database

**Solution:**
1. Check backend logs in `backend/logs/app.log`
2. Verify backend is connected to database
3. Check for errors in browser console

---

### Issue: Port already in use

**Windows:**
```cmd
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

---

## 📚 Additional Resources

- **Database Setup:** `database/SETUP-GUIDE.md`
- **Backend Setup:** `BACKEND-SETUP.md`
- **Backend Quick Start:** `backend/QUICK-START.md`
- **Frontend Setup:** `START-HERE.md`

---

## 🚀 Next Steps

After successful setup:

1. **Customize the System**
   - Add your city/constituency data
   - Configure departments
   - Add officers

2. **Configure Email/SMS**
   - Set up SMTP for email notifications
   - Configure SMS gateway

3. **Deploy to Production**
   - Set up hosting (AWS, Azure, etc.)
   - Configure domain names
   - Enable HTTPS
   - Set up backups

4. **Add Features**
   - Mobile app
   - Advanced analytics
   - AI-powered categorization
   - Chatbot support

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review log files
3. Verify all services are running
4. Check environment variables

---

**Last Updated:** February 24, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
