# CivicPath - Quick Start Guide

## ✅ System Status

Your system is now configured correctly:

- ✅ Backend: Running on port 5000
- ✅ Frontend: Running on port 3000
- ✅ Database: Connected to **civicpath**

## 📋 Step-by-Step: View Your Data in pgAdmin

### Step 1: Open pgAdmin and Connect to civicpath Database

1. Open **pgAdmin 4**
2. In the left sidebar, expand:
   - **Servers**
   - **PostgreSQL 18** (or your version)
   - **Databases**
3. You should see **civicpath** database listed
4. Click on **civicpath** to select it

### Step 2: Open Query Tool

1. Right-click on **civicpath** database
2. Select **"Query Tool"**
3. A new query window will open

### Step 3: View Your Complaints

Copy and paste this query:

```sql
SELECT 
    complaint_number,
    citizen_name,
    citizen_mobile,
    title,
    status,
    priority,
    created_at
FROM complaints 
ORDER BY created_at DESC;
```

Click the **Execute** button (▶️) or press **F5**

### Step 4: Submit a Test Complaint

1. Open your browser: **http://localhost:3000/citizen/report**
2. Fill in the complaint form:
   - Title: "Test complaint"
   - Description: "Testing the system"
   - Category: Select any
   - Location: Click on map
   - Contact: Your name and mobile
   - Accept terms
3. Click **"Submit Complaint"**
4. Note the Complaint ID shown

### Step 5: Verify in pgAdmin

1. Go back to pgAdmin
2. Click the **Execute** button (▶️) again to refresh the query
3. You should see your new complaint!

## 🔄 If You Don't See civicpath Database

If civicpath is not visible in pgAdmin:

1. Right-click on **"Servers"** → **"Register" → "Server"**
2. **General Tab:**
   - Name: `CivicPath`
3. **Connection Tab:**
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `civicpath`
   - Username: `civicpath_user`
   - Password: `mayursql`
   - ✅ Save password
4. Click **"Save"**

## 📊 Useful Queries

### Count Total Complaints
```sql
SELECT COUNT(*) as total FROM complaints;
```

### View Latest 10 Complaints
```sql
SELECT * FROM complaints ORDER BY created_at DESC LIMIT 10;
```

### View by Status
```sql
SELECT status, COUNT(*) as count 
FROM complaints 
GROUP BY status;
```

### Search by Mobile Number
```sql
SELECT * FROM complaints 
WHERE citizen_mobile = '9876543210';
```

## 🎯 URLs

- **Citizen Portal:** http://localhost:3000
- **Submit Complaint:** http://localhost:3000/citizen/report
- **Track Complaint:** http://localhost:3000/citizen/track
- **Admin Portal:** http://localhost:3002/admin/dashboard
- **Officer Portal:** http://localhost:3001/officer/dashboard
- **MLA Portal:** http://localhost:3003/mla/dashboard
- **Backend API:** http://localhost:5000/api/v1

## 🔧 Troubleshooting

### Backend Not Running?
```cmd
cd backend
npm run dev
```

### Frontend Not Running?
```cmd
npm run dev
```

### Clear Database?
```cmd
clear-database.bat
```

### Check Database Connection?
```cmd
verify-database.bat
```

## 📝 Database Credentials

- **Database:** civicpath
- **User:** civicpath_user
- **Password:** mayursql
- **Host:** localhost
- **Port:** 5432

---

**Need Help?** Check the error logs in `backend/logs/app.log`
