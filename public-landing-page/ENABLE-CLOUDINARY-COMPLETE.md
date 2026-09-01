# Enable Cloudinary - Complete Guide

## Current Status

✅ **Database Table**: `complaint_attachments` exists and working
✅ **Images Stored**: 1 image currently in local storage
✅ **Backend Code**: Ready for Cloudinary
⚠️ **Cloudinary**: Disabled (need valid credentials)

## Image Storage Comparison

### Current (Local Storage):
- Location: `backend/uploads/` folder
- URL: `uploads/attachments-1772042154235-959679046.png`
- Access: `http://localhost:5000/uploads/filename.png`

### After Cloudinary:
- Location: Cloudinary cloud
- URL: `https://res.cloudinary.com/your_cloud/image/upload/v1234567890/civicpath-complaints/filename.jpg`
- Access: Direct CDN URL (faster, global)

## Setup Steps

### Step 1: Get Cloudinary Account (FREE)

**Option A: New Account**
1. Go to: https://cloudinary.com/users/register_free
2. Sign up with email
3. Verify email
4. Login

**Option B: Existing Account**
1. Go to: https://cloudinary.com/console
2. Login with your credentials

### Step 2: Get Credentials

After login, you'll see Dashboard with:

```
Account Details
├── Cloud Name: xxxxx
├── API Key: xxxxxxxxxxxxx
└── API Secret: xxxxxxxxxxxxxxxxx
```

**Copy all three values!**

### Step 3: Update Configuration

**Method A: Automatic (Recommended)**
```bash
# Run this script
update-cloudinary-env.bat

# It will ask for:
# - Cloud Name
# - API Key
# - API Secret
# Then automatically update backend/.env
```

**Method B: Manual**
1. Open: `backend/.env` in notepad
2. Find these lines:
```env
CLOUDINARY_CLOUD_NAME=dred0i55o
CLOUDINARY_API_KEY=442387251121382
CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
USE_CLOUDINARY=false
```

3. Replace with your credentials:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
USE_CLOUDINARY=true
```

4. Save the file

### Step 4: Test Connection

```bash
cd backend
node test-cloudinary.js
```

**Expected Output:**
```
Testing Cloudinary connection...
Cloud Name: your_cloud_name
API Key: ***1234
✅ Cloudinary connection successful!
Status: ok
```

**If you see errors:**
- Double-check credentials (no extra spaces)
- Make sure you copied all three values
- Try copying again from Cloudinary dashboard

### Step 5: Restart Backend

Stop backend (Ctrl+C in terminal) and restart:
```bash
cd backend
npm run dev
```

**Look for this line:**
```
☁️  Cloudinary configured successfully
```

If you see this, Cloudinary is active! ✅

### Step 6: Test Upload

1. Go to your frontend
2. Submit a complaint with an image
3. Check the database:

```sql
SELECT file_name, file_url, uploaded_at 
FROM complaint_attachments 
ORDER BY uploaded_at DESC 
LIMIT 1;
```

**Local storage URL:**
```
uploads/attachments-1772042154235-959679046.png
```

**Cloudinary URL:**
```
https://res.cloudinary.com/your_cloud/image/upload/v1234567890/civicpath-complaints/abc123.jpg
```

### Step 7: View Images in Cloudinary

1. Go to: https://cloudinary.com/console/media_library
2. Look for folder: `civicpath-complaints`
3. You'll see all uploaded images there!

## Verification Commands

### Check Database
```sql
-- Count images
SELECT COUNT(*) FROM complaint_attachments;

-- View all images
SELECT 
    c.complaint_number,
    ca.file_name,
    ca.file_url,
    ca.file_type,
    ca.file_size_kb,
    ca.uploaded_at
FROM complaint_attachments ca
JOIN complaints c ON ca.complaint_id = c.id
ORDER BY ca.uploaded_at DESC;
```

### Check Backend Logs
Look for:
```
☁️  Cloudinary configured successfully
```

### Test API
```bash
curl http://localhost:5000/health
```

## Troubleshooting

### Error: "Unknown API key"
- Your API Key is wrong
- Copy it again from Cloudinary dashboard
- Make sure no extra spaces

### Error: "Invalid API secret"
- Your API Secret is wrong
- Copy the correct one from dashboard
- The secret is different from API Key

### Error: "Cloud name not found"
- Your Cloud Name is wrong
- Check exact spelling from dashboard
- Usually lowercase

### Images still going to local storage
- Check `USE_CLOUDINARY=true` in .env
- Restart backend after changing .env
- Check backend logs for Cloudinary message

## Files Created

- `get-cloudinary-credentials.bat` - Opens Cloudinary console
- `update-cloudinary-env.bat` - Updates .env automatically
- `backend/test-cloudinary.js` - Tests connection

## Summary

1. ✅ Get Cloudinary credentials
2. ✅ Update `backend/.env`
3. ✅ Test connection: `node test-cloudinary.js`
4. ✅ Restart backend: `npm run dev`
5. ✅ Upload test image
6. ✅ Verify in Cloudinary console

After this, all new images will be stored in Cloudinary cloud! 🎉
