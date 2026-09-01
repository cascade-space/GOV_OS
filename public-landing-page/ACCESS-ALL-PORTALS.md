# CivicPath - Access All Portals 🚀

## Quick Start

### 1. Start Backend Server
```bash
cd backend
npm start
```
**Backend URL**: `http://localhost:5000`

### 2. Start Frontend Server
```bash
npm run dev
```
**Frontend URL**: `http://localhost:3000`

---

## Portal Access URLs

### 🏛️ Citizen Portal (Public)
**URL**: `http://localhost:3000/citizen`

**Features**:
- Report new complaints
- Track complaint status
- View complaint history
- Multi-language support (English, Hindi, Kannada)

---

### 👨‍💼 Admin Portal
**URL**: `http://localhost:3000/admin`

**Key Pages**:
- Dashboard: `http://localhost:3000/admin/dashboard`
- **Complaints**: `http://localhost:3000/admin/complaints` ✅ FIXED
- Departments: `http://localhost:3000/admin/departments`
- Officers: `http://localhost:3000/admin/officers`
- Analytics: `http://localhost:3000/admin/analytics`
- Settings: `http://localhost:3000/admin/settings`

**Status**: ✅ All 9 complaints loading successfully

---

### 👮 Officer Portal (Desk)
**URL**: `http://localhost:3000/desk`

**Key Pages**:
- Dashboard: `http://localhost:3000/desk/dashboard`
- My Tasks: `http://localhost:3000/desk/tasks`
- Task Details: `http://localhost:3000/desk/tasks/[id]`

---

### 🏛️ MLA Portal
**URL**: `http://localhost:3000/mla`

**Key Pages**:
- Dashboard: `http://localhost:3000/mla/dashboard`
- Issues: `http://localhost:3000/mla/issues`
- Issue Details: `http://localhost:3000/mla/issues/[id]`
- Announcements: `http://localhost:3000/mla/announcements`

---

## API Endpoints

### Base URL
`http://localhost:5000/api/v1`

### Available Endpoints

#### Complaints
- `GET /api/v1/complaints` - Get all complaints
- `GET /api/v1/complaints/:id` - Get complaint by ID
- `POST /api/v1/complaints` - Create new complaint
- `PATCH /api/v1/complaints/:id` - Update complaint
- `DELETE /api/v1/complaints/:id` - Delete complaint

#### Officers
- `GET /api/v1/officers` - Get all officers
- `GET /api/v1/officers/:id` - Get officer by ID
- `GET /api/v1/officers/:id/tasks` - Get officer tasks

#### Admin
- `GET /api/v1/admin/dashboard` - Get dashboard stats
- `GET /api/v1/admin/analytics` - Get analytics data

#### MLA
- `GET /api/v1/mla/dashboard` - Get MLA dashboard
- `GET /api/v1/mla/issues` - Get constituency issues

#### Upload
- `POST /api/v1/upload` - Upload files to Cloudinary

---

## System Status Check

### Test Backend Connection
```bash
node test-admin-api.js
```

### Check Backend Health
```bash
curl http://localhost:5000/health
```

### Check Database
```bash
cd backend
node check-database.bat
```

---

## Current System Status

### ✅ Working Features
- Multi-language support (English, Hindi, Kannada)
- Cloudinary file uploads with UUID naming
- Admin complaints page with API integration
- Backend API with versioned endpoints
- Database with 9 test complaints
- Real-time error handling and retry

### 📊 Database Stats
- Total Complaints: 9
- Backend Status: Healthy
- Database: Connected
- API Version: v1

### 🔧 File Naming System
- Format: `UUID_COMPLAINT-NUMBER`
- Example: `7f3f3e89-30a2-49b0-88f3-fe12ba30bef4_CMP-2026-00015.jpg`
- Storage: Cloudinary (civicpath-complaints folder)

---

## Troubleshooting

### Backend Not Running
```bash
cd backend
npm install
npm start
```

### Frontend Not Running
```bash
npm install
npm run dev
```

### Database Connection Issues
1. Check PostgreSQL is running
2. Verify credentials in `backend/.env`
3. Run: `cd backend && node src/config/database.js`

### Admin Page Shows Blank
1. Verify backend is running on port 5000
2. Check API endpoint uses `/api/v1/` prefix
3. Run test script: `node test-admin-api.js`

---

## Quick Commands

### Start Everything
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
npm run dev
```

### Check System Status
```bash
node test-admin-api.js
```

### View Logs
```bash
cd backend
npm run logs
```

---

**Last Updated**: March 5, 2026
**System Version**: 1.1
**Status**: ✅ All Systems Operational
