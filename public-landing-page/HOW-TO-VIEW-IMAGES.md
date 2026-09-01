# How to View Uploaded Images in Database

## 📋 Quick Steps

### Step 1: Open pgAdmin
1. Open pgAdmin 4
2. Connect to PostgreSQL 18 server
3. Navigate to: **Databases → civic_platform**

### Step 2: Open Query Tool
1. Right-click on **civic_platform** database
2. Select **"Query Tool"**

### Step 3: Run Query to View Images

Copy and paste this query:

```sql
SELECT 
    c.ticket_number AS "Complaint ID",
    c.citizen_name AS "Citizen Name",
    c.title AS "Issue",
    ma.file_name AS "Image Filename",
    ma.file_url AS "Image URL",
    ROUND(ma.file_size / 1024.0, 2) AS "Size (KB)",
    ma.created_at AS "Uploaded At"
FROM media_attachments ma
JOIN complaints c ON ma.complaint_id = c.id
ORDER BY ma.created_at DESC;
```

Click **Execute (F5)** or press the ▶️ button.

## 🖼️ View Actual Images

### Method 1: Via Browser
1. Copy the "Image URL" from the query results
2. Open browser and paste: `http://localhost:5000/uploads/filename.jpg`

### Method 2: Via File Explorer
1. Navigate to: `C:\Users\Mayur\OneDrive\Desktop\CIVIC Project\civi1.1\backend\uploads`
2. All uploaded images are stored here
3. Double-click any image to view

### Method 3: In Admin Dashboard
1. Go to: `http://localhost:3001/admin/complaints`
2. Click on any complaint
3. Images should be displayed (if implemented in UI)

## 📊 Useful Queries

### Count Images Per Complaint
```sql
SELECT 
    c.ticket_number,
    c.title,
    COUNT(ma.id) as image_count
FROM complaints c
LEFT JOIN media_attachments ma ON c.id = ma.complaint_id
GROUP BY c.id, c.ticket_number, c.title
HAVING COUNT(ma.id) > 0
ORDER BY image_count DESC;
```

### Get Images for Specific Complaint
```sql
SELECT * FROM media_attachments ma
JOIN complaints c ON ma.complaint_id = c.id
WHERE c.ticket_number = 'CMP-2026-000014';
```

### Total Storage Used
```sql
SELECT 
    COUNT(*) as total_images,
    ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_mb
FROM media_attachments;
```

## ⚠️ Current Status

**Note:** Currently, images are NOT being uploaded to the server during complaint submission. The image upload functionality needs to be implemented.

To check if any images exist:
```sql
SELECT COUNT(*) FROM media_attachments;
```

If this returns 0, no images have been uploaded yet.

## 🔧 Image Upload Flow (When Implemented)

1. User uploads/captures image in complaint form
2. Image is sent to backend API
3. Backend saves file to `backend/uploads/` folder
4. Backend creates record in `media_attachments` table
5. Record includes:
   - `complaint_id` - Links to complaint
   - `file_url` - Path to image file
   - `file_name` - Original filename
   - `file_size` - Size in bytes
   - `mime_type` - Image type (image/jpeg, etc.)

## 📁 Database Table Structure

The `media_attachments` table has these columns:
- `id` - Unique identifier (UUID)
- `complaint_id` - Links to complaints table
- `file_url` - URL/path to the image
- `file_name` - Original filename
- `file_size` - Size in bytes
- `mime_type` - File type (image/jpeg, image/png)
- `created_at` - Upload timestamp

## 🎯 Next Steps

To enable image uploads:
1. Backend needs to handle file uploads
2. Save files to `backend/uploads/` folder
3. Create records in `media_attachments` table
4. Link images to complaints via `complaint_id`

Would you like me to implement the image upload functionality?
