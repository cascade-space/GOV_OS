# Setup Cloudinary - Step by Step

## Step 1: Get Cloudinary Account (2 minutes)

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with your email (FREE account)
3. Verify your email
4. Login to: https://cloudinary.com/console

## Step 2: Get Your Credentials

After logging in, you'll see your Dashboard with:

```
Cloud Name: xxxxxxxxx
API Key: xxxxxxxxxxxxxxxxx
API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Copy these three values!**

## Step 3: Update Backend Configuration

Open: `backend/.env`

Replace these lines:
```env
CLOUDINARY_CLOUD_NAME=dred0i55o
CLOUDINARY_API_KEY=442387251121382
CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
USE_CLOUDINARY=false
```

With your new credentials:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
USE_CLOUDINARY=true
```

## Step 4: Test Connection

Run:
```bash
cd backend
node test-cloudinary.js
```

You should see:
```
✅ Cloudinary connection successful!
Status: ok
```

## Step 5: Restart Backend

Stop the backend (Ctrl+C) and restart:
```bash
npm run dev
```

You should see:
```
☁️  Cloudinary configured successfully
```

## Step 6: Test Upload

Submit a complaint with an image from your frontend.

The image will now be stored in Cloudinary!

## How to Verify Images are in Cloudinary

1. Go to: https://cloudinary.com/console/media_library
2. You'll see uploaded images in the `civicpath-complaints` folder
3. Each image will have a Cloudinary URL like:
   `https://res.cloudinary.com/your_cloud_name/image/upload/...`

## Database Storage

The `complaint_attachments` table stores:
- **Local storage**: `file_url` = `/uploads/filename.jpg`
- **Cloudinary**: `file_url` = `https://res.cloudinary.com/...`

The database doesn't store the actual image, just the URL!

## Current Status

- ✅ Table exists: `complaint_attachments`
- ✅ Backend code ready for Cloudinary
- ⚠️ Cloudinary disabled (invalid credentials)
- 📝 Need: Valid Cloudinary credentials

## Quick Commands

```sql
-- Check uploaded images in database
SELECT * FROM complaint_attachments;

-- Count images
SELECT COUNT(*) FROM complaint_attachments;

-- View images with complaint info
SELECT 
    c.complaint_number,
    ca.file_name,
    ca.file_url,
    ca.file_type,
    ca.uploaded_at
FROM complaint_attachments ca
JOIN complaints c ON ca.complaint_id = c.id
ORDER BY ca.uploaded_at DESC;
```
