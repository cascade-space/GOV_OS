# How to Search Images in Cloudinary - Step by Step

## Step 1: Open Cloudinary Console

1. Open your browser
2. Go to: **https://cloudinary.com/console**
3. Login with your account

## Step 2: Go to Media Library

After login, you'll see the dashboard. Click on:
- **"Media Library"** in the left sidebar
- Or go directly to: https://cloudinary.com/console/media_library

## Step 3: Navigate to Your Folder

1. You'll see a list of folders
2. Click on: **"civicpath-complaints"**
3. All your uploaded images are here

## Step 4: Use the Search Bar

At the top of the page, you'll see a **search bar**. Here's how to use it:

### Simple Text Search

Just type in the search bar:

**Search by Name:**
```
john
```
or
```
john_doe
```

**Search by Mobile:**
```
9876543210
```

**Search by Category:**
```
infrastructure
```

### Advanced Tag Search

Click on the search bar and type:

**By Citizen Name:**
```
tags:citizen:john_doe
```

**By Mobile Number:**
```
tags:mobile:9876543210
```

**By Category:**
```
tags:category:infrastructure
```

**All CivicPath Images:**
```
tags:civicpath
```

## Step 5: View Search Results

After searching, you'll see:
- **Thumbnails** of matching images
- **Filenames** (with citizen names)
- **Upload dates**
- **File sizes**

## Step 6: Click on an Image

Click any image to see:

### Image Details:
- Full size preview
- Public URL
- File format and size
- Upload date

### Tags Section:
```
citizen:john_doe
mobile:9876543210
category:infrastructure
civicpath
complaint-image
```

### Context/Metadata Section:
```
citizen_name: John Doe
citizen_mobile: 9876543210
complaint_title: Pothole on Main Street
category: infrastructure
upload_date: 2026-02-25T18:30:45.123Z
```

## Quick Search Examples

### Example 1: Find all images by John Doe
1. Go to Media Library
2. Click search bar
3. Type: `john_doe`
4. Press Enter
5. See all John Doe's images

### Example 2: Find all infrastructure complaints
1. Go to Media Library
2. Click search bar
3. Type: `tags:category:infrastructure`
4. Press Enter
5. See all infrastructure images

### Example 3: Find images from mobile 9876543210
1. Go to Media Library
2. Click search bar
3. Type: `9876543210`
4. Press Enter
5. See all images from that mobile

## Using Filters

On the left side, you'll see filters:

### Filter by:
- **Format** (JPG, PNG, PDF)
- **Upload Date** (Today, This week, This month)
- **Size** (Small, Medium, Large)
- **Tags** (Click to filter by tag)

## Sorting Results

At the top right, you can sort by:
- **Upload Date** (Newest first / Oldest first)
- **File Name** (A-Z / Z-A)
- **File Size** (Largest / Smallest)

## Bulk Operations

1. **Select multiple images**: Click checkboxes on images
2. **Download**: Click "Download" button
3. **Delete**: Click "Delete" button
4. **Add to Collection**: Click "Add to Collection"

## Search Tips

### ✅ DO:
- Use simple text for quick search
- Use `tags:` for precise filtering
- Combine multiple search terms
- Use filters on the left

### ❌ DON'T:
- Don't use special characters in search
- Don't use spaces in tag names (use underscore)
- Don't forget the `tags:` prefix for tag search

## Common Searches

| What you want | Search query |
|---------------|--------------|
| All images by John Doe | `john_doe` or `tags:citizen:john_doe` |
| All images from mobile | `9876543210` or `tags:mobile:9876543210` |
| All infrastructure complaints | `tags:category:infrastructure` |
| All images uploaded today | Use date filter on left |
| All complaint images | `tags:complaint-image` |
| Images in specific folder | Navigate to `civicpath-complaints` |

## Visual Guide

```
┌─────────────────────────────────────────────────────┐
│ Cloudinary Console                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Search: john_doe                           ] 🔍  │
│                                                     │
│  Filters:              Results:                     │
│  ┌──────────┐         ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ Format   │         │ 📷   │ │ 📷   │ │ 📷   │  │
│  │ ☑ JPG    │         │ john │ │ john │ │ john │  │
│  │ ☐ PNG    │         │ _doe │ │ _doe │ │ _doe │  │
│  │          │         │ _987 │ │ _987 │ │ _987 │  │
│  │ Date     │         └──────┘ └──────┘ └──────┘  │
│  │ ○ Today  │                                      │
│  │ ○ Week   │         Tags: citizen:john_doe       │
│  │ ● All    │         Mobile: 9876543210           │
│  └──────────┘         Category: infrastructure     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Mobile App

Cloudinary also has a mobile app:
1. Download "Cloudinary" from App Store / Play Store
2. Login with your account
3. Browse and search images on mobile

## API Access (For Developers)

You can also search programmatically:

```javascript
// Search by tag
cloudinary.api.resources_by_tag('citizen:john_doe')

// Advanced search
cloudinary.search
  .expression('tags:mobile:9876543210')
  .execute()
```

## Need Help?

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Search Guide**: https://cloudinary.com/documentation/search_api
- **Support**: https://support.cloudinary.com

## Summary

✅ **Simple Search**: Just type name or mobile
✅ **Tag Search**: Use `tags:citizen:name` format
✅ **Filters**: Use left sidebar filters
✅ **Sort**: Use top-right sorting options
✅ **Details**: Click image to see full info

Now you can easily find any image in Cloudinary! 🎉
