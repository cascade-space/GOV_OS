# Cloudinary Image Storage with User Names

## ✅ What Was Changed

Modified Cloudinary upload configuration to include citizen information in:
1. **Filename** - Images stored with citizen name and mobile
2. **Metadata** - Citizen info attached to image in Cloudinary

## How It Works

### Before (Old):
```
Filename: civicpath-complaints/abc123xyz.jpg
Metadata: None
```

### After (New):
```
Filename: civicpath-complaints/john_doe_9876543210_1708896234567.jpg
Metadata: 
  - citizen_name: John Doe
  - citizen_mobile: 9876543210
  - upload_date: 2026-02-25T18:30:45.123Z
```

## Filename Format

```
{citizen_name}_{mobile}_{timestamp}.{extension}

Examples:
- john_doe_9876543210_1708896234567.jpg
- jane_smith_9123456789_1708896345678.png
- amit_kumar_8765432109_1708896456789.jpg
```

**Benefits:**
- ✅ Easy to identify who uploaded
- ✅ Searchable by name in Cloudinary
- ✅ Organized file structure
- ✅ Unique filenames (timestamp prevents duplicates)

## Metadata Stored

Each image in Cloudinary has attached metadata:

```json
{
  "context": {
    "citizen_name": "John Doe",
    "citizen_mobile": "9876543210",
    "upload_date": "2026-02-25T18:30:45.123Z"
  }
}
```

## View in Cloudinary Console

1. Go to: https://cloudinary.com/console/media_library
2. Navigate to: `civicpath-complaints` folder
3. Click on any image
4. You'll see:
   - **Filename**: Contains citizen name and mobile
   - **Context**: Shows citizen_name, citizen_mobile, upload_date

## Example Upload Flow

### Step 1: Citizen Submits Complaint
```javascript
{
  "citizenName": "John Doe",
  "citizenMobile": "9876543210",
  "title": "Pothole on Main Street",
  "files": [image1.jpg, image2.jpg]
}
```

### Step 2: Images Uploaded to Cloudinary
```
Image 1: john_doe_9876543210_1708896234567.jpg
Image 2: john_doe_9876543210_1708896234568.jpg
```

### Step 3: Database Record
```sql
INSERT INTO complaint_attachments (
  file_url,
  file_name,
  uploaded_by_name,
  uploaded_by_mobile
) VALUES (
  'https://res.cloudinary.com/dredol55o/image/upload/v1708896234567/civicpath-complaints/john_doe_9876543210_1708896234567.jpg',
  'image1.jpg',
  'John Doe',
  '9876543210'
);
```

## Search Images in Cloudinary

### By Name:
In Cloudinary console, search for: `john_doe`
- Shows all images uploaded by John Doe

### By Mobile:
Search for: `9876543210`
- Shows all images from that mobile number

### By Date:
Filter by upload_date in metadata

## API to Get Image Metadata

Using Cloudinary API:
```javascript
cloudinary.api.resource('civicpath-complaints/john_doe_9876543210_1708896234567', {
  context: true
}, (error, result) => {
  console.log(result.context);
  // Output: { citizen_name: 'John Doe', citizen_mobile: '9876543210', ... }
});
```

## Database Query with User Info

```sql
SELECT 
    c.complaint_number,
    c.citizen_name,
    c.citizen_mobile,
    ca.file_name,
    ca.file_url,
    ca.uploaded_by_name,
    ca.uploaded_by_mobile,
    ca.uploaded_at
FROM complaint_attachments ca
JOIN complaints c ON ca.complaint_id = c.id
ORDER BY ca.uploaded_at DESC;
```

**Result:**
```
complaint_number | citizen_name | file_url                                    | uploaded_by_name
-----------------|--------------|---------------------------------------------|------------------
CMP-2026-00003   | John Doe     | .../john_doe_9876543210_1708896234567.jpg  | John Doe
CMP-2026-00002   | Jane Smith   | .../jane_smith_9123456789_1708896345678.jpg| Jane Smith
```

## Benefits

### 1. Easy Identification
- Just look at filename to know who uploaded
- No need to check database

### 2. Better Organization
- Images grouped by user
- Easy to find specific user's uploads

### 3. Audit Trail
- Filename shows who and when
- Metadata provides additional context

### 4. Search & Filter
- Search by name in Cloudinary
- Filter by mobile number
- Sort by upload date

### 5. Accountability
- Clear ownership of each image
- Can contact uploader if needed

## Special Characters Handling

Names with special characters are cleaned:
```
Input: "Rāj Kumar!" → Output: raj_kumar
Input: "José García" → Output: jos_garc_a
Input: "李明" → Output: (removed, uses mobile)
```

## Testing

1. **Submit a complaint** with name "John Doe" and mobile "9876543210"
2. **Upload an image**
3. **Check Cloudinary**:
   - Go to media library
   - Look for: `john_doe_9876543210_*.jpg`
4. **Click on image** to see metadata

## Files Modified

- `backend/src/config/cloudinary.js` - Updated storage configuration

## Summary

✅ Images now stored with citizen name in filename
✅ Metadata includes citizen info
✅ Easy to search and identify in Cloudinary
✅ Better organization and accountability
✅ Database also stores uploader info

Now every image in Cloudinary will show who uploaded it! 🎉
