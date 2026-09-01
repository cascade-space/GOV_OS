# Cloudinary Search & Organization Guide

## ✅ Enhanced Cloudinary Storage

Images are now stored with:
1. **Structured Filename** - Easy to identify
2. **Searchable Tags** - Quick filtering
3. **Metadata Fields** - Detailed information
4. **Organized Folders** - Clean structure

## Image Organization

### Folder Structure
```
cloudinary/
└── civicpath-complaints/
    ├── john_doe_9876543210_1708896234567.jpg
    ├── jane_smith_9123456789_1708896345678.jpg
    └── amit_kumar_8765432109_1708896456789.jpg
```

### Filename Format
```
{citizen_name}_{mobile}_{timestamp}.{ext}

Examples:
- john_doe_9876543210_1708896234567.jpg
- jane_smith_9123456789_1708896345678.png
```

## Searchable Tags

Each image has these tags:

```javascript
tags: [
  'citizen:john_doe',           // Search by citizen name
  'mobile:9876543210',          // Search by mobile number
  'category:infrastructure',    // Search by complaint category
  'civicpath',                  // All CivicPath images
  'complaint-image'             // Type identifier
]
```

## Metadata Fields

Each image stores:

```javascript
context: {
  citizen_name: 'John Doe',
  citizen_mobile: '9876543210',
  complaint_title: 'Pothole on Main Street',
  category: 'infrastructure',
  upload_date: '2026-02-25T18:30:45.123Z',
  uploaded_by: 'citizen'
}
```

## How to Search in Cloudinary Console

### Method 1: Search by Tags

1. Go to: https://cloudinary.com/console/media_library
2. Click on **"Search"** or use the search bar
3. Use these search queries:

**Search by Citizen Name:**
```
tags:citizen:john_doe
```

**Search by Mobile:**
```
tags:mobile:9876543210
```

**Search by Category:**
```
tags:category:infrastructure
```

**All CivicPath Images:**
```
tags:civicpath
```

**Combine Multiple Tags:**
```
tags:citizen:john_doe AND tags:category:infrastructure
```

### Method 2: Search by Filename

In the search bar, type:
```
john_doe
```
or
```
9876543210
```

### Method 3: Filter by Folder

1. Navigate to: `civicpath-complaints` folder
2. All complaint images are here
3. Use search within folder

### Method 4: Advanced Search

Click **"Advanced Search"** and use:

**By Context (Metadata):**
```
context.citizen_name:John Doe
context.citizen_mobile:9876543210
context.category:infrastructure
```

**By Upload Date:**
```
uploaded_at:[2026-02-25 TO 2026-02-26]
```

**By File Type:**
```
format:jpg
format:png
```

## Search Examples

### Find all images by John Doe
```
tags:citizen:john_doe
```

### Find all infrastructure complaints
```
tags:category:infrastructure
```

### Find images from specific mobile
```
tags:mobile:9876543210
```

### Find images uploaded today
```
uploaded_at:[2026-02-25 TO 2026-02-26]
```

### Find all complaint images
```
tags:complaint-image
```

## Cloudinary Media Library Columns

When viewing images, you'll see:

| Column | Value | Example |
|--------|-------|---------|
| **Thumbnail** | Image preview | 🖼️ |
| **Public ID** | Filename | john_doe_9876543210_1708896234567 |
| **Format** | File type | JPG, PNG |
| **Size** | File size | 245 KB |
| **Dimensions** | Width x Height | 1920x1080 |
| **Tags** | All tags | citizen:john_doe, mobile:9876543210 |
| **Created** | Upload date | Feb 25, 2026 |

## View Image Details

Click on any image to see:

### Basic Info
- Public ID
- Format
- Size
- Dimensions
- URL

### Tags
```
citizen:john_doe
mobile:9876543210
category:infrastructure
civicpath
complaint-image
```

### Context (Metadata)
```
citizen_name: John Doe
citizen_mobile: 9876543210
complaint_title: Pothole on Main Street
category: infrastructure
upload_date: 2026-02-25T18:30:45.123Z
uploaded_by: citizen
```

## API Search Examples

### Using Cloudinary Admin API

**Search by tag:**
```javascript
cloudinary.api.resources_by_tag('citizen:john_doe', {
  type: 'upload',
  max_results: 50
}, (error, result) => {
  console.log(result.resources);
});
```

**Search by context:**
```javascript
cloudinary.search
  .expression('context.citizen_mobile:9876543210')
  .sort_by('created_at', 'desc')
  .max_results(30)
  .execute()
  .then(result => console.log(result));
```

**Search by folder and tag:**
```javascript
cloudinary.search
  .expression('folder:civicpath-complaints AND tags:category:infrastructure')
  .with_field('context')
  .with_field('tags')
  .max_results(50)
  .execute()
  .then(result => console.log(result));
```

## Organize by Collections

In Cloudinary console, you can create collections:

1. **By Citizen** - Group all images from one person
2. **By Category** - Infrastructure, sanitation, etc.
3. **By Date** - This week, this month
4. **By Status** - Pending, resolved

## Export Search Results

1. Search for images
2. Select multiple images
3. Click **"Download"** or **"Export"**
4. Get a ZIP file with all images

## Benefits of This Structure

### 1. Easy Search
✅ Search by citizen name
✅ Search by mobile number
✅ Search by category
✅ Search by date

### 2. Quick Filtering
✅ Filter by tags
✅ Filter by metadata
✅ Filter by folder

### 3. Better Organization
✅ All images in one folder
✅ Clear naming convention
✅ Structured metadata

### 4. Bulk Operations
✅ Select all images by tag
✅ Download multiple images
✅ Delete by criteria

### 5. Analytics
✅ Count images per citizen
✅ Count images per category
✅ Track upload trends

## Example Searches

### "Show me all images uploaded by John Doe"
```
tags:citizen:john_doe
```

### "Show me all infrastructure complaints"
```
tags:category:infrastructure
```

### "Show me images from mobile 9876543210"
```
tags:mobile:9876543210
```

### "Show me all images uploaded today"
```
uploaded_at:[2026-02-25 TO 2026-02-26]
```

### "Show me all complaint images"
```
folder:civicpath-complaints
```

## Database + Cloudinary Combined Search

### SQL Query:
```sql
SELECT 
    c.complaint_number,
    c.citizen_name,
    c.citizen_mobile,
    ca.file_url,
    ca.uploaded_by_name,
    ca.uploaded_at
FROM complaint_attachments ca
JOIN complaints c ON ca.complaint_id = c.id
WHERE c.citizen_name = 'John Doe'
ORDER BY ca.uploaded_at DESC;
```

### Then in Cloudinary:
```
tags:citizen:john_doe
```

Both will show the same images!

## Summary

✅ **Filename**: Contains citizen name and mobile
✅ **Tags**: Searchable by name, mobile, category
✅ **Metadata**: Detailed information stored
✅ **Folder**: All images organized in one place
✅ **Search**: Multiple ways to find images
✅ **Filter**: Easy filtering by any field

Now you can easily find any image in Cloudinary by:
- Citizen name
- Mobile number
- Complaint category
- Upload date
- Or any combination!

🎉 Your Cloudinary is now fully organized and searchable!
