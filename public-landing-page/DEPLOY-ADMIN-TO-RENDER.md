# Deploy Admin Panel to Render - Complete Guide

## Overview

You already have:
- ✅ Backend on Render
- ✅ Citizen Dashboard on Render
- ✅ Database on Render

Now we'll make sure the admin panel works on your existing Render frontend deployment.

## Good News! 🎉

Your admin panel is **already deployed** with your citizen dashboard! They're part of the same Next.js app.

If your citizen dashboard is at:
```
https://your-app.onrender.com
```

Then your admin panel is at:
```
https://your-app.onrender.com/admin/dashboard
https://your-app.onrender.com/admin/complaints
https://your-app.onrender.com/admin/officers
```

## Step-by-Step Setup

### Step 1: Update Environment Variables on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your **Frontend** service (the one with citizen dashboard)
3. Go to **Environment** tab
4. Add this environment variable:

```
Key: NEXT_PUBLIC_API_URL
Value: https://your-backend-name.onrender.com
```

**Important**: Replace `your-backend-name` with your actual backend service URL!

Example:
```
Key: NEXT_PUBLIC_API_URL
Value: https://civicpath-backend-abc123.onrender.com
```

5. Click **Save Changes**
6. Render will automatically redeploy

### Step 2: Update API Calls in Code

We need to update the hardcoded `localhost:5000` URLs to use the environment variable.

#### Update Admin Complaints Page

**File**: `src/app/admin/complaints/page.tsx`

Find line ~30 and update the `fetchComplaints` function:

```typescript
const fetchComplaints = async () => {
    try {
        setLoading(true);
        setError(null);
        // Use environment variable or fallback to localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/v1/complaints`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data) {
            const complaintsData = Array.isArray(data.data) ? data.data : data.data.complaints || [];
            console.log('Complaints loaded:', complaintsData.length);
            setComplaints(complaintsData);
        } else {
            console.warn('No complaints data in response');
            setComplaints([]);
        }
    } catch (error: any) {
        console.error('Error fetching complaints:', error);
        const errorMsg = error.message || 'Unknown error';
        setError(errorMsg);
        toast.error(`Failed to load complaints: ${errorMsg}`);
        setComplaints([]);
    } finally {
        setLoading(false);
    }
};
```

#### Update Admin Officers Page

**File**: `src/app/admin/officers/page.tsx`

Update all fetch calls to use environment variable:

```typescript
const fetchOfficers = async () => {
    try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/v1/admin/officers`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
            setOfficers(data.data);
        }
    } catch (error: any) {
        console.error('Error fetching officers:', error);
        setError(error.message);
        toast.error('Failed to load officers');
    } finally {
        setLoading(false);
    }
};

const fetchDepartments = async () => {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/v1/admin/departments`);
        const data = await response.json();
        if (data.success && data.data) {
            setDepartments(data.data);
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
    }
};

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.mobile || !formData.department_id) {
        toast.error('Please fill in all required fields');
        return;
    }
    
    try {
        setSaving(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/v1/admin/officers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (data.success) {
            toast.success('Officer added successfully!');
            setShowForm(false);
            setFormData({
                full_name: "",
                email: "",
                mobile: "",
                department_id: "",
                designation: "Field Officer"
            });
            fetchOfficers();
        } else {
            toast.error(data.message || 'Failed to add officer');
        }
    } catch (error: any) {
        console.error('Error adding officer:', error);
        toast.error('Failed to add officer. Please try again.');
    } finally {
        setSaving(false);
    }
};
```

### Step 3: Update Citizen Report Page (if needed)

**File**: `src/app/citizen/report/page.tsx`

Find any fetch calls and update them similarly:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/v1/complaints`, {
    method: 'POST',
    // ... rest of the code
});
```

### Step 4: Commit and Push Changes

```bash
git add -A
git commit -m "Update API URLs to use environment variable for Render deployment"
git push origin main
```

### Step 5: Verify Render Deployment

1. Go to Render Dashboard
2. Your frontend service should automatically redeploy (takes 5-10 minutes)
3. Watch the deployment logs
4. Wait for "Deploy succeeded" message

### Step 6: Test Your Admin Panel

Once deployed, access your admin panel:

```
https://your-app.onrender.com/admin/dashboard
https://your-app.onrender.com/admin/complaints
https://your-app.onrender.com/admin/officers
```

Test:
1. View complaints - should show data from Render database
2. Add new officer - should save to Render database
3. Submit complaint from citizen page - should appear in admin

---

## Important: CORS Configuration

Make sure your backend allows requests from your frontend domain.

### Update Backend CORS on Render

1. Go to Render Dashboard
2. Click on your **Backend** service
3. Go to **Environment** tab
4. Find or add `CORS_ORIGIN` variable:

```
Key: CORS_ORIGIN
Value: https://your-frontend.onrender.com,http://localhost:3000
```

Example:
```
Key: CORS_ORIGIN
Value: https://civicpath-app.onrender.com,http://localhost:3000
```

5. Save and redeploy backend

---

## Quick Checklist

Before deploying, make sure:

- [ ] Backend is deployed and running on Render
- [ ] Database is created and schema is set up
- [ ] Frontend environment variable `NEXT_PUBLIC_API_URL` is set
- [ ] Backend environment variable `CORS_ORIGIN` includes frontend URL
- [ ] All API calls updated to use environment variable
- [ ] Code committed and pushed to GitHub
- [ ] Render auto-deploys from GitHub

---

## Testing After Deployment

### Test 1: Backend Health
```bash
curl https://your-backend.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Test 2: Complaints API
```bash
curl https://your-backend.onrender.com/api/v1/complaints
```

Should return list of complaints.

### Test 3: Admin Panel
1. Open: `https://your-frontend.onrender.com/admin/complaints`
2. Should see complaints list
3. Try adding an officer
4. Submit a complaint from citizen page
5. Verify it appears in admin

---

## Troubleshooting

### Issue: "Failed to load complaints"

**Check**:
1. Backend is running: Visit `https://your-backend.onrender.com/health`
2. Environment variable is set correctly in Render
3. CORS is configured properly
4. Check Render logs for errors

### Issue: CORS Error

**Solution**:
1. Update `CORS_ORIGIN` in backend environment variables
2. Include your frontend URL
3. Redeploy backend
4. Clear browser cache

### Issue: 404 Not Found

**Check**:
1. Backend URL is correct (no trailing slash)
2. API routes are deployed
3. Backend service is running
4. Check backend logs

---

## Your Deployment URLs

After deployment, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| Backend | `https://your-backend.onrender.com` | API server |
| Frontend | `https://your-frontend.onrender.com` | All pages |
| Citizen | `https://your-frontend.onrender.com/citizen` | Public portal |
| Admin | `https://your-frontend.onrender.com/admin` | Admin panel |
| Officer | `https://your-frontend.onrender.com/desk` | Officer portal |
| MLA | `https://your-frontend.onrender.com/mla` | MLA portal |

---

## Next Steps

1. Update the code with environment variables
2. Commit and push to GitHub
3. Set environment variable on Render
4. Wait for auto-deployment
5. Test admin panel on Render
6. Share your URLs if you need help!

---

**Need Help?** Share your:
- Backend URL
- Frontend URL
- Any error messages

And I'll help you troubleshoot!
