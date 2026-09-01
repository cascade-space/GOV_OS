# Image Upload with User Information - Complete

## ✅ What Was Added

### New Database Columns
Added to `complaint_attachments` table:
- `uploaded_by_name` - Name of person who uploaded the image
- `uploaded_by_mobile` - Mobile number of uploader

### Updated Backend Code
Modified `backend/src/controllers/complaint.controller.js` to save uploader information when images are uploaded.

## Database Structure

```sql
complaint_attachments table:
├── id (UUID)
├── complaint_id (UUID) → links to complaints table
├── file_name (VARCHAR) - Original filename
├── file_url (TEXT) - Cloudinary or local URL
├── file_type (ENUM) - photo/video/document/audio
├── file_size_kb (INTEGER) - Size in KB
├── mime_type (VARCHAR) - image/jpeg, etc.
├── uploaded_by_role (ENUM) - citizen/officer/admin
├── uploaded_at (TIMESTAMP) - When uploaded
├── uploaded_by_name (VARCHAR) ← NEW!
└── uploaded_by_mobile (VARCHAR) ← NEW!
```

## How It Works

When a citizen submits a complaint with images:

1. **Complaint is created** with citizen info:
   - citizen_name
   - citizen_mobile
   - citizen_email

2. **Images are uploaded** to Cloudinary

3. **Attachment records are saved** with:
   - File URL (Cloudinary link)
   - File name
   - File type
   - **Uploader name** (from citizen_name)
   - **Uploader mobile** (from citizen_mobile)

## View Images with Uploader Info

### SQL Query:
```sql
SELECT 
    c.complaint_number,
    ca.file_name,
    ca.file_url,
    ca.uploaded_by_name,
    ca.uploaded_by_mobile,
    ca.uploaded_at
FROM complaint_attachments ca
JOIN complaints c ON ca.complaint_id = c.id
ORDER BY ca.uploaded_at DESC;
```

### In pgAdmin:
1. Open Query Tool
2. Run: `database/view-images-with-uploader.sql`
3. You'll see all images with uploader information

## Example Data

```
complaint_number | file_name        | uploaded_by_name | uploaded_by_mobile | uploaded_at
-----------------|------------------|------------------|--------------------|-----------------
CMP-2026-00003   | pothole.jpg      | John Doe         | 9876543210        | 2026-02-25 23:45
CMP-2026-00002   | streetlight.png  | Jane Smith       | 9123456789        | 2026-02-25 23:30
```

## Check Uploads by User

```sql
-- Count images uploaded by each user
SELECT 
    uploaded_by_name,
    uploaded_by_mobile,
    COUNT(*) as total_uploads
FROM complaint_attachments
WHERE uploaded_by_name IS NOT NULL
GROUP BY uploaded_by_name, uploaded_by_mobile
ORDER BY total_uploads DESC;
```

## API Response

When you fetch complaint details, you'll get:

```json
{
  "complaint": {
    "complaint_number": "CMP-2026-00003",
    "title": "Pothole on Main Street",
    "citizen_name": "John Doe",
    "citizen_mobile": "9876543210"
  },
  "attachments": [
    {
      "file_name": "pothole.jpg",
      "file_url": "https://res.cloudinary.com/dredol55o/image/upload/...",
      "file_type": "photo",
      "uploaded_by_name": "John Doe",
      "uploaded_by_mobile": "9876543210",
      "uploaded_at": "2026-02-25T18:15:30.000Z"
    }
  ]
}
```

## Benefits

✅ **Track who uploaded each image**
✅ **Audit trail for attachments**
✅ **Contact uploader if needed**
✅ **Verify image authenticity**
✅ **Better accountability**

## Testing

1. **Submit a complaint** with an image
2. **Check database**:
   ```sql
   SELECT * FROM complaint_attachments ORDER BY uploaded_at DESC LIMIT 1;
   ```
3. **Verify** uploaded_by_name and uploaded_by_mobile are populated

## Files Created

- `database/add-uploader-info.sql` - SQL to add columns
- `database/view-images-with-uploader.sql` - Queries to view data
- `IMAGE-UPLOAD-WITH-USER-INFO.md` - This documentation

## Summary

✅ Database columns added
✅ Backend code updated
✅ Uploader information now saved with each image
✅ Can track who uploaded what
✅ Ready to use!

Now when anyone uploads an image, their name and mobile number will be automatically saved! 🎉
