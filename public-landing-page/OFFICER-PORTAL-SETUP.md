# Officer Portal - Separate Port Setup

## 🚀 Quick Start

### Method 1: Double-Click Batch File (Easiest)
Simply double-click: **`run-officer-portal.bat`**

The officer portal will start on `http://localhost:3001`

### Method 2: Command Line
```bash
npm run dev:officer
```

---

## 📍 Access URLs

Once started, access the officer portal at:

- **Dashboard:** `http://localhost:3001/officer/dashboard`
- **History:** `http://localhost:3001/officer/history`
- **Profile:** `http://localhost:3001/officer/profile`
- **Task Detail:** `http://localhost:3001/officer/tasks/c1`

---

## 🎯 What You Can Do

### Officer Dashboard
- View active tasks
- See completed tasks
- Check overdue tasks
- Quick stats overview

### Task Management
- Click any task to view details
- Update task status
- Add work notes
- Upload proof photos
- Call citizen directly
- Navigate to location

### History
- View all completed tasks
- See resolution dates
- Track performance

### Profile
- Update contact information
- View achievements
- Manage preferences

---

## 🔧 All Available Batch Files

### Individual Portals
- **`run-officer-portal.bat`** - Officer Portal (Port 3001)
- **`run-admin-portal.bat`** - Admin Portal (Port 3002)
- **`run-mla-portal.bat`** - MLA Portal (Port 3003)

### All Portals at Once
- **`run-all-portals.bat`** - Starts all 4 portals simultaneously

---

## 📊 Port Assignments

| Portal | Port | URL |
|--------|------|-----|
| Citizen | 3000 | http://localhost:3000/citizen |
| Officer | 3001 | http://localhost:3001/officer/dashboard |
| Admin | 3002 | http://localhost:3002/admin/login |
| MLA | 3003 | http://localhost:3003/mla/dashboard |

---

## 🧪 Testing the Officer Portal

### Step 1: Start the Server
```bash
npm run dev:officer
```
Or double-click `run-officer-portal.bat`

### Step 2: Open Browser
Navigate to: `http://localhost:3001/officer/dashboard`

### Step 3: Explore Features
- View task list
- Click on a task (e.g., CMP-2024-00341)
- Try updating status
- Add work notes
- Upload photos

---

## 🎬 Demo Scenario

### Scenario: Field Officer Updates Task

1. **Start Officer Portal**
   ```bash
   npm run dev:officer
   ```

2. **Open Dashboard**
   - Go to `http://localhost:3001/officer/dashboard`
   - See list of active tasks

3. **Select a Task**
   - Click on "Large pothole on MG Road"
   - View full details

4. **Update Status**
   - Click "Update Task" button
   - Select "In Progress"
   - Add note: "Team dispatched to location"
   - Upload photo (optional)
   - Submit

5. **View History**
   - Go to History page
   - See completed tasks

---

## 🔄 Running Multiple Portals

### For Testing/Demo
Open 4 separate terminals:

**Terminal 1 - Citizen:**
```bash
npm run dev
```

**Terminal 2 - Officer:**
```bash
npm run dev:officer
```

**Terminal 3 - Admin:**
```bash
npm run dev:admin
```

**Terminal 4 - MLA:**
```bash
npm run dev:mla
```

### Or Use Batch File
Double-click: **`run-all-portals.bat`**

This will open 4 terminal windows automatically!

---

## 🛑 Stopping the Server

### Method 1: In Terminal
Press `Ctrl + C`

### Method 2: Close Window
Simply close the terminal window

### Method 3: Kill Port
```bash
npx kill-port 3001
```

---

## 🐛 Troubleshooting

### Port 3001 Already in Use
```bash
# Kill the process
npx kill-port 3001

# Or use different port
next dev -p 3005
```

### Server Not Starting
```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
npm install

# Try again
npm run dev:officer
```

### Changes Not Reflecting
1. Stop the server (Ctrl + C)
2. Clear browser cache
3. Restart server
4. Hard refresh browser (Ctrl + Shift + R)

---

## 📱 Mobile Testing

The officer portal is fully responsive. Test on mobile:

1. Find your computer's IP address:
   ```bash
   ipconfig
   ```

2. Access from mobile on same network:
   ```
   http://YOUR_IP:3001/officer/dashboard
   ```

Example: `http://192.168.1.100:3001/officer/dashboard`

---

## 🎨 Features Available

### ✅ Fully Functional
- Task list with filters
- Task detail view
- Status updates
- Work notes
- Photo upload
- Call citizen
- Navigate to location
- History tracking
- Profile management

### 📊 Real-time Updates
- Task status changes
- SLA tracking
- Performance metrics

---

## 💡 Tips

1. **Bookmark the URL** for quick access
2. **Use multiple browser windows** to test different users
3. **Check mobile view** for field officer experience
4. **Test photo upload** with actual images
5. **Try all status transitions** to see the workflow

---

## 🚀 Production Deployment

For production, all portals run on the same domain:
```
yourdomain.com/officer/dashboard
```

No need for separate ports in production!

---

## 📞 Quick Reference

### Start Officer Portal
```bash
npm run dev:officer
```

### Access URL
```
http://localhost:3001/officer/dashboard
```

### Stop Server
```
Ctrl + C
```

### View All Tasks
```
http://localhost:3001/officer/dashboard
```

### View Task Detail
```
http://localhost:3001/officer/tasks/c1
```

---

## ✅ Summary

The officer portal is now configured to run on **port 3001**. You can:

1. ✅ Run it separately from other portals
2. ✅ Access it at `http://localhost:3001`
3. ✅ Use the batch file for easy startup
4. ✅ Run multiple portals simultaneously
5. ✅ Test all officer features independently

**Ready to use!** 🎉
