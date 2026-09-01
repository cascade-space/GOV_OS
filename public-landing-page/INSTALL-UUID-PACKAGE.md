# Install UUID Package

## Required Action

The backend now uses the `uuid` package for generating unique file identifiers. You need to install it.

## Installation Steps

### Option 1: Install in Backend Directory
```bash
cd backend
npm install
```

This will install all dependencies including the newly added `uuid` package.

### Option 2: Install UUID Only
```bash
cd backend
npm install uuid
```

## Verification

After installation, verify the package is installed:

```bash
cd backend
npm list uuid
```

You should see:
```
civicpath-backend@1.0.0
└── uuid@9.0.1
```

## Why UUID?

The system now uses UUID (Universally Unique Identifier) for file naming:

**Format:** `UUID_COMPLAINT-NUMBER`

**Example:** `7f3f3e89-30a2-49b0-88f3-fe12ba30bef4_CMP-2026-00015.jpg`

### Benefits:
- ✅ Globally unique identifiers
- ✅ No naming conflicts
- ✅ Industry standard format
- ✅ Better for distributed systems
- ✅ Privacy-focused (no personal info)

## Testing

After installation, restart the backend server:

```bash
cd backend
npm run dev
```

Then test by uploading a photo through the complaint form. The file should be named with UUID format in Cloudinary.
