# Multi-Port Setup Guide

## Running Different Portals on Different Ports

Since all portals (Citizen, Admin, Officer, MLA) are part of the same Next.js application, they share the same codebase. However, you can run multiple instances on different ports for testing or demonstration purposes.

---

## Available Commands

### Default Development Server
```bash
npm run dev
```
- Runs on: `http://localhost:3000`
- Access all portals from this single instance

### Officer Portal (Port 3001)
```bash
npm run dev:officer
```
- Runs on: `http://localhost:3001`
- Direct link: `http://localhost:3001/officer/dashboard`

### Admin Portal (Port 3002)
```bash
npm run dev:admin
```
- Runs on: `http://localhost:3002`
- Direct link: `http://localhost:3002/admin/login`

### MLA Portal (Port 3003)
```bash
npm run dev:mla
```
- Runs on: `http://localhost:3003`
- Direct link: `http://localhost:3003/mla/dashboard`

---

## How to Use

### Option 1: Run Single Instance (Recommended)
```bash
npm run dev
```
Then access different portals:
- Citizen: `http://localhost:3000/citizen`
- Admin: `http://localhost:3000/admin/login`
- Officer: `http://localhost:3000/officer/dashboard`
- MLA: `http://localhost:3000/mla/dashboard`

### Option 2: Run Multiple Instances Simultaneously

**Terminal 1 - Citizen Portal:**
```bash
npm run dev
```
Access at: `http://localhost:3000/citizen`

**Terminal 2 - Officer Portal:**
```bash
npm run dev:officer
```
Access at: `http://localhost:3001/officer/dashboard`

**Terminal 3 - Admin Portal:**
```bash
npm run dev:admin
```
Access at: `http://localhost:3002/admin/login`

**Terminal 4 - MLA Portal:**
```bash
npm run dev:mla
```
Access at: `http://localhost:3003/mla/dashboard`

---

## Direct URLs for Each Portal

### Citizen Portal
- **Port 3000 (default):**
  - Home: `http://localhost:3000/citizen`
  - Report: `http://localhost:3000/citizen/report`
  - Track: `http://localhost:3000/citizen/track`

### Officer Portal
- **Port 3001:**
  - Dashboard: `http://localhost:3001/officer/dashboard`
  - History: `http://localhost:3001/officer/history`
  - Profile: `http://localhost:3001/officer/profile`
  - Task Detail: `http://localhost:3001/officer/tasks/c1`

### Admin Portal
- **Port 3002:**
  - Login: `http://localhost:3002/admin/login`
  - Dashboard: `http://localhost:3002/admin/dashboard`
  - Complaints: `http://localhost:3002/admin/complaints`
  - Analytics: `http://localhost:3002/admin/analytics`
  - Settings: `http://localhost:3002/admin/settings`

### MLA Portal
- **Port 3003:**
  - Dashboard: `http://localhost:3003/mla/dashboard`
  - Issues: `http://localhost:3003/mla/issues`
  - Directives: `http://localhost:3003/mla/directives`

---

## Demo Credentials

### Admin Login
- Email: `admin@civic.gov`
- Password: `admin123`

### Test Complaint IDs
- `CMP-2024-00341` - In Progress
- `CMP-2024-00342` - Assigned (Escalated)
- `CMP-2024-00343` - Submitted

---

## Use Cases

### For Development
Run single instance on port 3000:
```bash
npm run dev
```

### For Testing Multiple Users
Run multiple instances to simulate different users:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:officer

# Terminal 3
npm run dev:admin
```

### For Demonstration
Run each portal on separate ports and open in different browser windows to show simultaneous usage.

---

## Important Notes

1. **Same Codebase**: All instances run the same code, just on different ports
2. **Shared Data**: All instances share the same mock data
3. **Hot Reload**: Changes to code will reflect in all running instances
4. **Memory Usage**: Running multiple instances uses more RAM
5. **Port Conflicts**: Make sure ports 3000-3003 are available

---

## Stopping Servers

### Stop Single Server
Press `Ctrl + C` in the terminal

### Stop All Servers
Press `Ctrl + C` in each terminal window running a server

---

## Production Deployment

For production, you only need one instance:
```bash
npm run build
npm start
```

All portals will be accessible from the same domain:
- `yourdomain.com/citizen`
- `yourdomain.com/admin`
- `yourdomain.com/officer`
- `yourdomain.com/mla`

---

## Quick Start for Officer Portal

**Step 1:** Open terminal
```bash
npm run dev:officer
```

**Step 2:** Open browser
```
http://localhost:3001/officer/dashboard
```

**Step 3:** View tasks and manage complaints

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on specific port
npx kill-port 3001

# Or use different port
next dev -p 3005
```

### Multiple Instances Not Working
Make sure you're running each command in a separate terminal window.

### Changes Not Reflecting
Stop all servers and restart:
```bash
# Stop all (Ctrl + C in each terminal)
# Then restart
npm run dev:officer
```

---

## Summary

- **Single Port (3000)**: Use `npm run dev` - Access all portals
- **Officer Port (3001)**: Use `npm run dev:officer` - Dedicated officer portal
- **Admin Port (3002)**: Use `npm run dev:admin` - Dedicated admin portal
- **MLA Port (3003)**: Use `npm run dev:mla` - Dedicated MLA portal

All portals are fully functional on any port! 🚀
