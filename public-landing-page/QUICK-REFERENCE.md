# Quick Reference Guide

## 🚀 Getting Started

### Run Development Server
```bash
npm run dev
```
Visit: `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

---

## 📍 Key URLs

### Citizen
- Home: `/citizen`
- Report Issue: `/citizen/report`
- Track Issue: `/citizen/track`

### Admin
- Login: `/admin/login` (admin@civic.gov / admin123)
- Dashboard: `/admin/dashboard`
- Complaints: `/admin/complaints`
- Analytics: `/admin/analytics`
- Settings: `/admin/settings`

### Officer
- Dashboard: `/officer/dashboard`
- History: `/officer/history`
- Profile: `/officer/profile`

### MLA
- Dashboard: `/mla/dashboard`
- Issues: `/mla/issues`
- Directives: `/mla/directives`

### Public
- Dashboard: `/public`

---

## 🎯 New Features Added

### 1. Terms and Conditions (Step 5)
- Location: `/citizen/report` - Step 5
- Comprehensive 10-section T&C
- Acceptance checkbox required
- Submit button disabled until accepted

### 2. Enhanced Notifications
- Shows complaint ID
- Confirms mobile updates
- 5-second duration

### 3. Auto-Tracking
- Auto-redirect after submission
- Auto-search on tracking page
- Success banner for new complaints

---

## 🔄 Complete Submission Flow

```
Report Form (5 Steps)
  ↓
Accept Terms
  ↓
Submit
  ↓
Success Notification (5s)
  ↓
Auto-Redirect (2s)
  ↓
Tracking Page
  ↓
Auto-Search (0.5s)
  ↓
Show Status
```

---

## 📋 Form Steps

1. **Issue Details**
   - Title (min 10 chars)
   - Description (min 20 chars)
   - Category & Sub-category
   - Priority

2. **Location**
   - Interactive map
   - GPS location
   - Address auto-fill

3. **Photos** (Optional)
   - Drag & drop
   - Up to 5 images

4. **Contact**
   - Name (min 2 chars)
   - Mobile (10 digits)

5. **Terms & Conditions** (NEW!)
   - Read T&C
   - Check acceptance box
   - Submit activates

---

## 🎨 UI States

### Submit Button
- **Disabled**: Terms not accepted (gray, not-allowed cursor)
- **Active**: Terms accepted (blue, pointer cursor)
- **Loading**: Submitting (spinner, disabled)

### Tracking Page
- **Loading**: Skeleton loaders
- **New Complaint**: Success banner + next steps
- **Existing**: Full details + timeline
- **Not Found**: Error message

---

## 🧪 Test Data

### Demo Complaint IDs
- `CMP-2024-00341` - In Progress
- `CMP-2024-00342` - Assigned (Escalated)
- `CMP-2024-00339` - Resolved
- `CMP-2024-00345` - Validated
- `CMP-2024-00343` - Submitted

### Demo Mobile Numbers
- `9876543210` - Ramesh Kumar
- `9123456789` - Priya Sharma

### Admin Login
- Email: `admin@civic.gov`
- Password: `admin123`

---

## 📊 Key Features

### Citizen Features
✅ Multi-step form with validation
✅ Interactive map
✅ Photo upload
✅ Terms acceptance
✅ Auto-tracking
✅ Status updates

### Admin Features
✅ Complaint management
✅ Assign to department/officer
✅ Update status
✅ Escalate complaints
✅ Analytics dashboard
✅ Settings management

### Officer Features
✅ Task list
✅ Update task status
✅ Add work notes
✅ Upload proof photos
✅ Call citizen
✅ Navigate to location

### MLA Features
✅ Executive dashboard
✅ Issue overview
✅ Send directives
✅ Escalate issues
✅ Performance metrics

---

## 🔧 Technical Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **Maps**: Leaflet + React-Leaflet
- **HTTP**: Axios
- **Notifications**: React Hot Toast
- **File Upload**: React Dropzone

---

## 📱 Responsive Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Laptop: 1024px - 1919px
- Desktop: 1920px+

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📚 Documentation Files

1. `README.md` - Project overview
2. `FEATURES.md` - Complete feature list
3. `IMPLEMENTATION-SUMMARY.md` - Technical details
4. `TERMS-AND-CONDITIONS-UPDATE.md` - T&C implementation
5. `COMPLAINT-SUBMISSION-FLOW.md` - User flow
6. `FINAL-IMPLEMENTATION-SUMMARY.md` - Final summary
7. `QUICK-REFERENCE.md` - This file

---

## ✅ Checklist

### Before Deployment
- [ ] Test all forms
- [ ] Test all buttons
- [ ] Test responsive design
- [ ] Test on different browsers
- [ ] Check console for errors
- [ ] Verify API endpoints
- [ ] Test error handling
- [ ] Check loading states

### After Deployment
- [ ] Verify all pages load
- [ ] Test complaint submission
- [ ] Test tracking functionality
- [ ] Check admin features
- [ ] Verify officer features
- [ ] Test MLA features
- [ ] Monitor error logs

---

## 🎯 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint

# Deploy to GitHub Pages
npm run deploy
```

---

## 📞 Support

For issues or questions:
- Check documentation files
- Review error messages
- Check browser console
- Verify API connectivity

---

**Last Updated**: February 24, 2026

**Status**: ✅ All Features Functional

**Build**: ✅ Successful
