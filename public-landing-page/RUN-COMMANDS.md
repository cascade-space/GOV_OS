# 🚀 CivicPath - Run Commands

## Quick Start (Easiest Way)

### Option 1: Start Everything at Once
**Double-click this file:**
```
start-complete-system.bat
```
This will open 4 windows:
- Backend API (Port 5000)
- Citizen Portal (Port 3000)
- Officer Portal (Port 3001)
- MLA Portal (Port 3003)

---

## Individual Commands

### Start Backend Only
**Double-click:**
```
start-backend.bat
```

**Or manually:**
```bash
cd backend
npm run dev
```

Backend will run on: http://localhost:5000

---

### Start All Frontend Portals
**Double-click:**
```
start-frontend-all.bat
```

**Or manually:**
```bash
# Terminal 1 - Citizen Portal
npm run dev

# Terminal 2 - Officer Portal
npm run dev:officer

# Terminal 3 - MLA Portal
npm run dev:mla
```

---

### Start Individual Frontend Portals

#### Citizen Portal (Port 3000)
```bash
npm run dev
```
Open: http://localhost:3000/citizen

#### Officer Portal (Port 3001)
```bash
npm run dev:officer
```
Open: http://localhost:3001/officer/dashboard

#### MLA Portal (Port 3003)
```bash
npm run dev:mla
```
Open: http://localhost:3003/mla/dashboard

#### Admin Portal (Port 3002)
```bash
npm run dev:admin
```
Open: http://localhost:3002/admin/login

---

## 📊 System URLs

Once all servers are running:

| Portal | URL | Purpose |
|--------|-----|---------|
| **Backend API** | http://localhost:5000 | API Server |
| **Citizen Portal** | http://localhost:3000/citizen | Submit complaints |
| **Officer Portal** | http://localhost:3001/officer/dashboard | Manage tasks |
| **MLA Portal** | http://localhost:3003/mla/dashboard | View constituency issues |
| **Admin Portal** | http://localhost:3002/admin/login | System administration |

---

## 🔍 Verify Everything is Running

### Check Backend
```bash
curl http://localhost:5000
```
Should return:
```json
{
  "message": "CivicPath API Server Running",
  "version": "v1",
  "status": "healthy"
}
```

### Check Frontend
Open browser to any portal URL above.

---

## 🛑 Stop Servers

### Stop All
Press `Ctrl + C` in each terminal window.

### Kill Ports (if stuck)
```bash
# Kill backend
npx kill-port 5000

# Kill frontend portals
npx kill-port 3000 3001 3003
```

---

## 🔄 Restart Servers

1. Stop all servers (Ctrl + C)
2. Run the start commands again

Or just type `rs` in the terminal running nodemon (backend).

---

## 📝 Development Workflow

### Typical Development Session

1. **Start Backend First**
   ```bash
   cd backend
   npm run dev
   ```
   Wait for: "✅ Database connected successfully"

2. **Start Frontend Portal(s)**
   ```bash
   # In project root
   npm run dev:officer
   ```

3. **Make Changes**
   - Backend: Auto-reloads on file changes
   - Frontend: Auto-reloads on file changes

4. **Test**
   - Submit complaint from citizen portal
   - Check it appears in database
   - View in officer portal

---

## 🧪 Testing Commands

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Get all complaints
curl http://localhost:5000/api/v1/complaints

# Submit complaint
curl -X POST http://localhost:5000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d @test-complaint.json
```

### Test Database Connection
```bash
# Connect to database
psql -U civicpath_user -d civicpath

# Check complaints
SELECT complaint_number, title, status FROM complaints;

# Exit
\q
```

---

## 📦 Install Dependencies (First Time Only)

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
npm install
```

---

## 🔧 Environment Setup (First Time Only)

### Backend
```bash
cd backend
copy .env.example .env
# Edit .env with your database password
```

---

## 🎯 Quick Test Flow

1. **Start Complete System**
   ```
   Double-click: start-complete-system.bat
   ```

2. **Submit Complaint**
   - Go to: http://localhost:3000/citizen/report
   - Fill form and submit
   - Note the Complaint ID

3. **Verify in Database**
   ```bash
   psql -U civicpath_user -d civicpath
   SELECT * FROM complaints ORDER BY created_at DESC LIMIT 1;
   ```

4. **Check Officer Portal**
   - Go to: http://localhost:3001/officer/dashboard
   - See your complaint in the list

5. **Track Complaint**
   - Go to: http://localhost:3000/citizen/track
   - Enter Complaint ID
   - See status and history

---

## 💡 Tips

- **Backend must be running** for frontend to save data
- **Wait 5-10 seconds** after starting servers before opening browser
- **Check terminal output** for any errors
- **Backend logs** are in `backend/logs/app.log`
- **Database must be running** (PostgreSQL service)

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
# Check .env file has correct password
# Check port 5000 is not in use
npx kill-port 5000
```

### Frontend won't start
```bash
# Check ports are not in use
npx kill-port 3000 3001 3003

# Reinstall dependencies
npm install
```

### Can't connect to database
```bash
# Test connection
psql -U civicpath_user -d civicpath

# If fails, check PostgreSQL service is running
```

---

## 📚 More Information

- **Complete Setup:** `COMPLETE-SETUP-GUIDE.md`
- **Backend Details:** `BACKEND-SETUP.md`
- **Database Setup:** `database/SETUP-GUIDE.md`

---

**Last Updated:** February 24, 2026
