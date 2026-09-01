# Cloudinary File Naming System

## Overview

The system now uses complaint ID and complaint number for naming uploaded files in Cloudinary instead of citizen personal information (name and phone number). This improves privacy and makes file management more organized.

## How It Works

### 1. Initial Upload (Temporary Name)
When a citizen uploads photos during complaint submission:
- A UUID (Universally Unique Identifier) is generated for each file
- Files are uploaded with a temporary name: `temp_[UUID]`
- Example: `temp_7f3f3e89-30a2-49b0-88f3-fe12ba30bef4`
- Tagged as `temp-upload` for easy identification
- Stored in folder: `civicpath-complaints/`

### 2. After Complaint Creation (Rename)
Once the complaint is successfully created in the database:
- Files are automatically renamed to: `[UUID]_[COMPLAINT_NUMBER]`
- Example: `7f3f3e89-30a2-49b0-88f3-fe12ba30bef4_CMP-2026-00015`
- Temporary tag is removed
- New tags added: `complaint:[COMPLAINT_NUMBER]`, `id:[COMPLAINT_ID]`

## File Naming Format

### New Format (UUID-based)
```
[UUID]_[COMPLAINT_NUMBER]
```

**Example:**
```
7f3f3e89-30a2-49b0-88f3-fe12ba30bef4_CMP-2026-00015.jpg
```

Where:
- `7f3f3e89-30a2-49b0-88f3-fe12ba30bef4` = UUID (unique identifier for the file)
- `CMP-2026-00015` = Complaint Number (unique identifier for citizens)

### Previous Format (Deprecated)
```
[COMPLAINT_NUMBER]_[COMPLAINT_ID]_[TIMESTAMP]
```

**Example:**
```
CMP-2024-00123_456_1772225847009.jpg
```

### Old Format (Deprecated)
```
[CITIZEN_NAME]_[PHONE_NUMBER]_[TIMESTAMP]
```

**Example:**
```
akshay_kumar_7406899490_1772225847009.jpg
```

## Benefits

### 1. Privacy Protection
- ✅ No personal information (name, phone) in file names
- ✅ Citizen identity protected in Cloudinary dashboard
- ✅ Complies with data privacy best practices

### 2. Better Organization
- ✅ UUID ensures globally unique file identification
- ✅ Easy to search by complaint number
- ✅ All files for a complaint grouped together
- ✅ Clear relationship between files and complaints
- ✅ No naming conflicts even with concurrent uploads

### 3. Professional Management
- ✅ Industry-standard UUID format
- ✅ Consistent naming convention
- ✅ Easy to identify orphaned files
- ✅ Better for auditing and tracking
- ✅ Scalable for large volumes

## Cloudinary Tags

Each uploaded file has the following tags:

### During Upload (Temporary)
- `category:[CATEGORY]` - e.g., `category:roads`
- `civicpath` - System identifier
- `complaint-image` - File type
- `temp-upload` - Temporary status

### After Complaint Creation
- `complaint:[COMPLAINT_NUMBER]` - e.g., `complaint:CMP-2024-00123`
- `id:[COMPLAINT_ID]` - e.g., `id:456`
- `category:[CATEGORY]` - e.g., `category:roads`
- `civicpath` - System identifier
- `complaint-image` - File type

## Cloudinary Metadata

Each file includes structured metadata:

### Initial Metadata
```json
{
  "category": "roads",
  "upload_date": "2024-02-24T10:30:00.000Z",
  "uploaded_by": "citizen",
  "status": "pending",
  "uuid": "7f3f3e89-30a2-49b0-88f3-fe12ba30bef4"
}
```

### Updated Metadata (After Complaint Creation)
```json
{
  "complaint_number": "CMP-2026-00015",
  "complaint_id": "456",
  "category": "roads",
  "status": "active",
  "uuid": "7f3f3e89-30a2-49b0-88f3-fe12ba30bef4"
}
```

## Searching Files in Cloudinary

### By Complaint Number
```
tag:complaint:CMP-2024-00123
```

### By Complaint ID
```
tag:id:456
```

### By Category
```
tag:category:roads
```

### Temporary Uploads (Not Yet Assigned)
```
tag:temp-upload
```

## Code Implementation

### Cloudinary Configuration
File: `backend/src/config/cloudinary.js`

```javascript
const { v4: uuidv4 } = require('uuid');

// Initial upload with UUID-based temporary name
const uuid = uuidv4();
const publicId = `temp_${uuid}`;

// Rename function after complaint creation
const renameCloudinaryFile = async (oldPublicId, complaintNumber, complaintId, category) => {
    // Extract UUID from temp filename
    const uuid = oldPublicId.replace('temp_', '');
    
    // New format: UUID_COMPLAINT-NUMBER
    const newPublicId = `${uuid}_${complaintNumber}`;
    // ... rename logic
};
```

### Complaint Controller
File: `backend/src/controllers/complaint.controller.js`

```javascript
// After complaint creation, rename Cloudinary files
if (useCloudinary && file.path) {
    const newUrl = await renameCloudinaryFile(
        oldPublicId,
        complaintData.complaint_number,
        complaintData.id,
        category
    );
}
```

## Migration Notes

### Existing Files
Old files with citizen names will continue to work but should be renamed:
1. Run a migration script to rename existing files
2. Update database URLs with new Cloudinary URLs
3. Verify all files are accessible

### Cleanup
Periodically check for temporary uploads that weren't completed:
```
tag:temp-upload AND uploaded_at < 24_hours_ago
```

## Environment Variables

No changes required to environment variables. The system uses existing Cloudinary configuration:

```env
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing

### Test Upload Flow
1. Submit a complaint with photos
2. Check Cloudinary dashboard for temporary files
3. Verify files are renamed after complaint creation
4. Confirm tags and metadata are updated

### Verify File Access
1. Get complaint details from API
2. Check attachment URLs
3. Verify images load correctly
4. Confirm no personal info in URLs

## Troubleshooting

### Files Not Renamed
- Check backend logs for rename errors
- Verify Cloudinary API credentials
- Ensure complaint creation was successful

### Temporary Files Accumulating
- Check for failed complaint submissions
- Run cleanup script for old temp files
- Review error logs for upload issues

## Security Considerations

1. ✅ No PII in file names
2. ✅ Complaint numbers are public identifiers (safe to expose)
3. ✅ Internal IDs provide additional tracking
4. ✅ Timestamps prevent naming conflicts
5. ✅ Folder structure isolates complaint files

## Future Enhancements

- [ ] Automatic cleanup of temporary files older than 24 hours
- [ ] Bulk rename utility for existing files
- [ ] Enhanced metadata with location and priority
- [ ] Thumbnail generation with complaint number watermark
- [ ] Archive old complaint files after resolution
