# Test Image Upload Functionality

## What Was Fixed

1. **Validation Middleware** - Updated to parse location JSON from FormData
2. **Upload Middleware** - Fixed import statement in routes
3. **Backend Restarted** - Applied all changes

## How to Test

### Step 1: Submit a Complaint with Images

1. Go to http://localhost:3001/citizen/report
2. Fill out the complaint form (all 5 steps)
3. In Step 3 (Photos):
   - Click "Choose Files" to upload images from your computer, OR
   - Click "Take Photo" to capture from webcam
   - You can add up to 5 photos
4. Complete the form and submit

### Step 2: Verify Images in Database

Run this SQL query in pgAdmin:

```sql
-- View all uploaded images
SELECT 
    c.ticket_number AS "Complaint ID",
    c.citizen_name AS "Citizen Name",
    c.title AS "Issue Title",
    ma.file_name AS "Image Filename",
    ma.file_url AS "Image URL",
    ma.created_at AS "Uploaded At"
FROM media_attachments ma
JOIN complaints c ON ma.complaint_id = c.id
ORDER BY ma.created_at DESC;
```

### Step 3: Check Physical Files

Images are saved in: `backend/uploads/`

File naming format: `attachments-{timestamp}-{random}.{ext}`

Example: `attachments-1740502270123-123456789.jpg`

## Database Table

The `media_attachments` table stores:
- `complaint_id` - Links to the complaint
- `file_name` - Original filename
- `file_url` - Path to file (e.g., `/uploads/attachments-123.jpg`)
- `file_size` - Size in bytes
- `mime_type` - File type (e.g., `image/jpeg`)
- `upload_phase` - Always 'submission' for citizen uploads
- `created_at` - Upload timestamp

## Troubleshooting

### If images don't upload:

1. Check backend logs:
   ```
   Look at the terminal where backend is running
   ```

2. Verify uploads folder exists:
   ```
   backend/uploads/ should exist
   ```

3. Check file permissions on uploads folder

4. Verify database table exists:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'media_attachments';
   ```

### If table doesn't exist:

Run: `database/check-media-table.sql` in pgAdmin to create it

## Next Steps

To display images in admin/officer/MLA portals, we need to:
1. Fetch images from API when viewing complaint details
2. Display images in a gallery format
3. Add ability to view full-size images

Let me know if you want me to implement the image display functionality!
