# How to Update Cloudinary Credentials

## Current Status
- Cloudinary: **DISABLED**
- File Storage: **LOCAL** (backend/uploads/)
- Reason: Invalid API credentials

## Why Update Cloudinary?

### Benefits of Cloudinary:
- ✅ Cloud storage (no local disk usage)
- ✅ Automatic image optimization
- ✅ CDN delivery (faster loading)
- ✅ Image transformations
- ✅ Better for production deployment

### Local Storage (Current):
- ✅ Works offline
- ✅ No external dependencies
- ✅ Free
- ❌ Files stored on server disk
- ❌ No CDN
- ❌ Manual backups needed

## Steps to Enable Cloudinary

### Step 1: Get Cloudinary Credentials

1. Go to https://cloudinary.com/
2. Sign up for a FREE account (or log in)
3. After login, you'll see your Dashboard
4. Copy these three values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 2: Update Backend Configuration

Edit `backend/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
USE_CLOUDINARY=true
```

### Step 3: Test Connection

```bash
cd backend
node test-cloudinary.js
```

Expected output:
```
✅ Cloudinary connection successful!
Status: ok
```

If you see errors, double-check your credentials.

### Step 4: Restart Backend

Stop the backend (Ctrl+C) and restart:
```bash
npm run dev
```

You should see:
```
☁️  Cloudinary configured successfully
```

### Step 5: Test Upload

Try submitting a complaint with an image from the frontend.

## Verification

### Check if Cloudinary is Active

Look at backend startup logs:
- ✅ With Cloudinary: `☁️  Cloudinary configured successfully`
- ❌ Without Cloudinary: (no cloudinary message)

### Check Where Files Are Stored

**Local Storage:**
- Files in: `backend/uploads/`
- URL format: `http://localhost:5000/uploads/filename.jpg`

**Cloudinary:**
- Files in: Cloudinary cloud
- URL format: `https://res.cloudinary.com/your_cloud_name/...`

## Troubleshooting

### Error: "Unknown API key"
- Your API Key is invalid
- Copy the correct key from Cloudinary dashboard
- Make sure there are no extra spaces

### Error: "Invalid API secret"
- Your API Secret is wrong
- Copy the correct secret from Cloudinary dashboard
- The secret is different from the API Key

### Error: "Cloud name not found"
- Your Cloud Name is incorrect
- Check the exact spelling from dashboard
- It's usually lowercase

## Current Configuration

File: `backend/.env`
```env
CLOUDINARY_CLOUD_NAME=dred0i55o
CLOUDINARY_API_KEY=442387251121382
CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
USE_CLOUDINARY=false  # ← Currently DISABLED
```

## Recommendation

For development: **Keep local storage** (current setup)
For production: **Enable Cloudinary** (follow steps above)

## Need Help?

1. Check Cloudinary documentation: https://cloudinary.com/documentation
2. Verify credentials at: https://cloudinary.com/console
3. Test connection using: `node backend/test-cloudinary.js`
