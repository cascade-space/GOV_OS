# Connect Local Admin to Render Backend

## Your Current Setup
✅ Backend deployed on Render (e.g., `https://your-backend.onrender.com`)
✅ User Dashboard deployed on Render (e.g., `https://your-frontend.onrender.com`)
❌ Local Admin (`localhost:3000/admin`) trying to connect to `localhost:5000` (not working)

## The Problem
Your local admin page is hardcoded to call `http://localhost:5000/api/v1/...` but your backend is on Render, not localhost!

## Solution: Update API URLs to Point to Render

### Step 1: Find Your Render Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your backend service
3. Copy the URL (looks like: `https://civicpath-backend.onrender.com`)

### Step 2: Create Environment Variable File

Create a new file: `.env.local` in your project root (not in backend folder)

```env
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
```

**Replace** `your-backend-name` with your actual Render backend URL!

Example:
```env
NEXT_PUBLIC_API_URL=https://civicpath-backend-abc123.onrender.com
```

### Step 3: Update Admin Complaints Page

**File**: `src/app/admin/complaints/page.tsx`

Find this line (around line 30):
```typescript
const response = await fetch('http://localhost:5000/api/v1/complaints');
```

Replace with:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/v1/complaints`);
```

### Step 4: Update Admin Officers Page

**File**: `src/app/admin/officers/page.tsx`

Find these lines:
```typescript
const response = await fetch('http://localhost:5000/api/v1/admin/officers');
// and
const response = await fetch('http://localhost:5000/api/v1/admin/departments');
// and
const response = await fetch('http://localhost:5000/api/v1/admin/officers', {
```

Replace all with:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/v1/admin/officers`);
// etc.
```

### Step 5: Restart Your Local Frontend

```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

### Step 6: Test

1. Go to `http://localhost:3000/admin/complaints`
2. You should now see complaints from your Render database!

---

## Better Solution: Create API Client

Instead of updating every file, let's create a centralized API configuration.

### Step 1: Update API Client

**File**: `src/lib/api-client.ts`

```typescript
// Get API URL from environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = {
  baseUrl: API_BASE_URL,
  
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async patch(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Helper to get full API URL
export const getApiUrl = (path: string = '') => {
  return `${API_BASE_URL}${path}`;
};
```

### Step 2: Use API Client in Pages

Then in your admin pages, use:

```typescript
import { apiClient } from '@/lib/api-client';

// Instead of:
const response = await fetch('http://localhost:5000/api/v1/complaints');

// Use:
const data = await apiClient.get('/api/v1/complaints');
```

---

## Quick Fix (Fastest Way)

If you want the quickest fix right now:

### Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Update `src/app/admin/complaints/page.tsx`:

Find line ~30:
```typescript
const response = await fetch('http://localhost:5000/api/v1/complaints');
```

Replace with:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${apiUrl}/api/v1/complaints`);
```

### Restart dev server:
```bash
npm run dev
```

Done! Your local admin will now connect to Render backend.

---

## Important: CORS Configuration

Your Render backend needs to allow requests from localhost.

### Check Render Environment Variables

1. Go to Render Dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Find `CORS_ORIGIN` variable
5. Make sure it includes your local URL:

```
CORS_ORIGIN=http://localhost:3000,https://your-frontend.onrender.com
```

If not, add it and redeploy.

---

## Testing Checklist

After making changes:

- [ ] Created `.env.local` with Render backend URL
- [ ] Updated admin complaints page
- [ ] Updated admin officers page  
- [ ] Restarted dev server
- [ ] Tested: Submit complaint on Render frontend
- [ ] Tested: View complaint on local admin
- [ ] Verified: Data appears correctly

---

## What URLs to Use

| Component | Development (Local) | Production (Render) |
|-----------|-------------------|-------------------|
| Backend API | `http://localhost:5000` | `https://your-backend.onrender.com` |
| Frontend | `http://localhost:3000` | `https://your-frontend.onrender.com` |
| Admin (Local) | `http://localhost:3000/admin` | Use Render frontend |

---

## Summary

**Problem**: Local admin calling localhost backend, but backend is on Render

**Solution**: 
1. Create `.env.local` with Render backend URL
2. Update fetch calls to use environment variable
3. Restart dev server

**Result**: Local admin → Render backend → Render database ✅

---

Need your Render backend URL? Share it and I'll help you configure everything!
