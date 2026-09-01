# Cloudinary Setup Guide - Free Cloud Storage

## Why Cloudinary?

✅ **25 GB free storage** (vs 1GB on Supabase)  
✅ **25 GB free bandwidth/month**  
✅ **No credit card required**  
✅ **Automatic image optimization** (saves 50-80% bandwidth)  
✅ **Built-in CDN** (fast worldwide delivery)  
✅ **Easy setup** (5 minutes)

---

## Step 1: Create Free Cloudinary Account

1. Go to: https://cloudinary.com/users/register_free
2. Fill in:
   - Email address
   - Password
   - Choose "Developer" as role
3. Click "Create Account"
4. Verify your email

---

## Step 2: Get Your API Credentials

1. After login, you'll see your **Dashboard**
2. Look for the **Account Details** section (top of page)
3. You'll see:
   ```
   Cloud Name: your_cloud_name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz
   ```
4. Click "👁️ Reveal" to see the API Secret

---

## Step 3: Update Backend Configuration

1. Open `backend/.env` file
2. Replace these values:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
   USE_CLOUDINARY=true
   ```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dcx5y8abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=Abc123XYZ789def456GHI
USE_CLOUDINARY=true
```

---

## Step 4: Restart Backend

Stop and restart your backend server:

```bash
# In backend folder
npm run dev
```

You should see: `☁️ Cloudinary configured successfully`

---

## Step 5: Test Upload

1. Go to http://localhost:3001/citizen/report
2. Submit a complaint with photos
3. Images will now upload to Cloudinary!

---

## How to Verify It's Working

### Check Cloudinary Dashboard:
1. Go to https://console.cloudinary.com/console/media_library
2. Look for folder: `civicpath-complaints`
3. Your uploaded images will be there!

### Check Database:
```sql
SELECT file_url FROM media_attachments ORDER BY created_at DESC LIMIT 5;
```

You'll see URLs like:
```
https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/civicpath-complaints/abc123.jpg
```

---

## Benefits You Get

### 1. Automatic Optimization
- Images are compressed automatically
- Saves 50-80% bandwidth
- Faster loading for users

### 2. Responsive Images
- Cloudinary serves different sizes for mobile/desktop
- Better performance

### 3. CDN Delivery
- Images load fast worldwide
- No server load

### 4. Transformations
- Resize: `?w=300&h=300`
- Crop: `?c=fill`
- Quality: `?q=auto`

---

## Switching Between Local and Cloudinary

### Use Cloudinary (Recommended):
```env
USE_CLOUDINARY=true
```

### Use Local Storage:
```env
USE_CLOUDINARY=false
```

---

## Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| Storage | 25 GB |
| Bandwidth | 25 GB/month |
| Transformations | 25,000/month |
| Images | Unlimited |

**This is enough for:**
- ~25,000 complaint photos (1MB each)
- ~100,000 page views/month
- Perfect for government civic applications!

---

## Troubleshooting

### Error: "Invalid credentials"
- Double-check Cloud Name, API Key, and API Secret
- Make sure no extra spaces in .env file

### Error: "Cloudinary not configured"
- Make sure `USE_CLOUDINARY=true` in .env
- Restart backend server

### Images not showing in dashboard
- Wait 1-2 minutes for first upload
- Refresh Cloudinary dashboard
- Check Media Library > civicpath-complaints folder

---

## Next Steps

Once Cloudinary is working:
1. ✅ Images upload to cloud automatically
2. ✅ No local storage needed
3. ✅ Fast CDN delivery
4. ✅ Automatic optimization

Need help? Let me know!
