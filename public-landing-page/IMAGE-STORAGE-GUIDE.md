# Image Storage Guide - CivicPath

## 📁 Where Images Are Stored

### 1. File System Storage
**Location:** `backend/uploads/`

All uploaded images are stored in this folder with unique filenames.

**Example:**
```
backend/uploads/
├── complaint-1234567890-photo1.jpg
├── complaint-1234567891-photo2.jpg
└── complaint-1234567892-photo3.png
```

### 2. Database Storage
**Table:** `media_attachments`

Stores metadata about each image:
- `id` - Unique identifier
- `complaint_id` - Links to complaint
- `file_path` - Path to file
- `file_name` - Original filename
- `file_type` - MIME type (image/jpeg, image/png)
- `file_size` - Size in bytes
- `uploaded_at` - Upload timestamp

## 🔍 How to View Images

### Method 1: Direct URL Access
Images can be accessed via browser:
```
http://localhost:5000/uploads/filename.jpg
```

### Method 2: Query Database for Image URLs
```sql
-- Get all images for a specific complaint
SELECT 
    ma.id,
    ma.file_name,
    ma.file_path,
    ma.file_type,
    ma.file_size,
    ma.uploaded_at,
    c.ticket_number
FROM media_attachments ma
JOIN complaints c ON ma.complaint_id = c.id
WHERE c.ticket_number = 'CMP-2026-000014'
ORDER BY ma.uploaded_at;
```

### Method 3: View in File Explorer
1. Navigate to: `C:\Users\Mayur\OneDrive\Desktop\CIVIC Project\civi1.1\backend\uploads`
2. All uploaded images are stored here
3. Double-click to view

## 📊 View Images in Admin Dashboard

The admin complaint detail page should display all images. To check:

1. Go to: `http://localhost:3001/admin/complaints/[complaint-id]`
2. Images should be displayed in the complaint details

## 🗄️ Database Queries

### Get All Images with Complaint Info
```sql
SELECT 
    c.ticket_number AS "Complaint ID",
    c.citizen_name AS "Citizen",
    c.title AS "Issue",
    ma.file_name AS "Image Name",
    ma.file_size AS "Size (bytes)",
    ma.uploaded_at AS "Uploaded At",
    CONCAT('http://localhost:5000/uploads/', ma.file_path) AS "Image URL"
FROM media_attachments ma
JOIN complaints c ON ma.complaint_id = c.id
ORDER BY ma.uploaded_at DESC;
```

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

### Get Total Storage Used
```sql
SELECT 
    COUNT(*) as total_images,
    SUM(file_size) as total_bytes,
    ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_mb
FROM media_attachments;
```

## 🔧 Image Upload Configuration

Current settings in `backend/.env`:
```env
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf
```

## 📝 How Images Are Currently Handled

### During Complaint Submission:
1. User uploads/captures images in Step 3
2. Images are sent to backend with complaint data
3. Backend saves files to `backend/uploads/`
4. File metadata is stored in `media_attachments` table
5. Complaint is linked to images via `complaint_id`

### Current Issue:
The complaint submission currently doesn't upload images to the server. The images are only stored in the browser's memory.

## ✅ To Fix Image Upload

The complaint submission needs to be updated to:
1. Upload images to backend first
2. Get the file URLs
3. Include URLs in complaint submission

Would you like me to implement proper image upload functionality?

## 🖼️ View Images in pgAdmin

To see which complaints have images:
```sql
SELECT 
    c.ticket_number,
    c.title,
    c.citizen_name,
    COUNT(ma.id) as num_images
FROM complaints c
LEFT JOIN media_attachments ma ON c.id = ma.complaint_id
GROUP BY c.id, c.ticket_number, c.title, c.citizen_name
ORDER BY c.created_at DESC;
```

## 📂 Backup Images

To backup all uploaded images:
```cmd
xcopy "backend\uploads\*.*" "backup\uploads\" /E /I /Y
```

## 🗑️ Clean Up Old Images

To remove images older than 30 days:
```sql
-- First, get the file paths
SELECT file_path FROM media_attachments 
WHERE uploaded_at < NOW() - INTERVAL '30 days';

-- Then delete from database
DELETE FROM media_attachments 
WHERE uploaded_at < NOW() - INTERVAL '30 days';
```

Note: You'll need to manually delete the physical files from the uploads folder.
