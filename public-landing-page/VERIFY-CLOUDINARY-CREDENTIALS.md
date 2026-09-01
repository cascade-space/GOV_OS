# How to Verify Cloudinary Credentials

## Step 1: Go to Cloudinary Console

1. Open your browser
2. Go to: https://cloudinary.com/console
3. Login with your account

## Step 2: Find Your Dashboard

After login, you should see the **Dashboard** page with a section called:

```
Product Environment Settings
```

## Step 3: Locate API Keys Section

Look for a section that shows:

```
API Keys
┌─────────────────────────────────────────┐
│ Cloud name: dreddi55o                   │
│ API Key: 442391251121382                │
│ API Secret: ●●●●●●●●●●●●●●●●●●●●●●●●●●● │
│ [Show] [Copy]                           │
└─────────────────────────────────────────┘
```

## Step 4: Verify Each Credential

### Cloud Name
- Should be: `dreddi55o`
- Location: Visible directly on dashboard
- ✅ This is correct in your .env file

### API Key
- Should be: `442391251121382`
- Location: Visible directly on dashboard
- ✅ This is correct in your .env file

### API Secret
- Should be: `DzIRRoSb3yDkxbqX1nmnI9OKqWE`
- Location: Hidden by default (shows as dots ●●●●●)
- Click **"Show"** or **"Copy"** button to reveal
- ✅ This is correct in your .env file

## Step 5: Double-Check API Secret

The API Secret is the most common issue. To verify:

1. In Cloudinary console, find the API Secret field
2. Click the **"Show"** button (eye icon) or **"Copy"** button
3. Compare with what's in your `backend/.env` file:
   ```
   CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
   ```
4. Make sure they match EXACTLY (no extra spaces)

## Step 6: Check Environment Variable Format

In `backend/.env`, verify the format is exactly:

```env
CLOUDINARY_CLOUD_NAME=dreddi55o
CLOUDINARY_API_KEY=442391251121382
CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
USE_CLOUDINARY=true
```

**Important:**
- No quotes around values
- No spaces before or after `=`
- No extra lines between them
- `USE_CLOUDINARY=true` (not false)

## Step 7: Test Connection

Run this command:
```bash
cd backend
node test-cloudinary.js
```

**Expected Success:**
```
Testing Cloudinary connection...
Cloud Name: dreddi55o
API Key: ***1382
✅ Cloudinary connection successful!
Status: ok
```

**If you see error:**
```
❌ Cloudinary connection failed!
Error: undefined
```

This means one of the credentials is wrong.

## Step 8: Alternative - Check in Browser Console

1. Go to: https://cloudinary.com/console
2. Press F12 (open Developer Tools)
3. Go to Console tab
4. Type: `cloudinary.config()`
5. You'll see your actual credentials

## Step 9: Verify Account Status

Make sure your Cloudinary account is:
- ✅ Active (not suspended)
- ✅ Email verified
- ✅ Free tier or paid plan active

Check at: https://cloudinary.com/console/settings/account

## Common Issues

### Issue 1: Wrong Cloud Name
**Symptom:** "Cloud name not found"
**Fix:** 
- Cloud name is case-sensitive
- Should be exactly: `dreddi55o`
- No spaces, no typos

### Issue 2: Wrong API Key
**Symptom:** "Unknown API key"
**Fix:**
- Copy API Key again from dashboard
- Should be exactly: `442391251121382`
- All numbers, no letters

### Issue 3: Wrong API Secret
**Symptom:** "Invalid signature" or "Authentication failed"
**Fix:**
- Click "Show" button in Cloudinary console
- Copy the FULL secret (27 characters)
- Should be: `DzIRRoSb3yDkxbqX1nmnI9OKqWE`
- Mix of uppercase, lowercase, numbers

### Issue 4: Extra Spaces
**Symptom:** Connection fails silently
**Fix:**
```env
# WRONG (has spaces)
CLOUDINARY_API_SECRET= DzIRRoSb3yDkxbqX1nmnI9OKqWE 

# CORRECT (no spaces)
CLOUDINARY_API_SECRET=DzIRRoSb3yDkxbqX1nmnI9OKqWE
```

## Step 10: Screenshot Comparison

Take a screenshot of your Cloudinary console showing:
1. Cloud Name
2. API Key
3. API Secret (after clicking Show)

Compare with `backend/.env` file line by line.

## Quick Verification Checklist

- [ ] Logged into https://cloudinary.com/console
- [ ] Can see Dashboard with API Keys section
- [ ] Cloud Name matches: `dreddi55o`
- [ ] API Key matches: `442391251121382`
- [ ] API Secret matches: `DzIRRoSb3yDkxbqX1nmnI9OKqWE`
- [ ] No extra spaces in .env file
- [ ] USE_CLOUDINARY=true (not false)
- [ ] Backend restarted after changing .env
- [ ] Test script shows success

## If Everything Matches But Still Fails

Try regenerating API keys:
1. Go to: https://cloudinary.com/console/settings/security
2. Click "Regenerate API Secret"
3. Copy the NEW secret
4. Update `backend/.env` with new secret
5. Restart backend

## Need Help?

Run this to see current .env values:
```bash
cd backend
type .env | findstr CLOUDINARY
```

This will show what's actually in your .env file.
