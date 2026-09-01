# Add Mapbox Token to Render Frontend

## Issue
The heatmap shows "Mapbox token not configured" because the environment variable is missing on Render.

## Solution

### Step 1: Get Your Mapbox Token
Your Mapbox token is stored in `.env.local` file in your project root.

### Step 2: Add to Render
1. Go to https://dashboard.render.com
2. Select your frontend service (civicpath-frontend)
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Add:
   - Key: `NEXT_PUBLIC_MAPBOX_TOKEN`
   - Value: (copy from your .env.local file - starts with pk.eyJ...)

### Step 3: Wait for Deployment
1. Click "Save Changes"
2. Render will automatically trigger a new deployment
3. Wait 2-3 minutes for deployment to complete
4. Check the "Events" tab to see deployment status

### Step 4: Verify
1. Once deployment shows "Live", open your site
2. Do a hard refresh:
   - Desktop: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Mobile: Clear browser cache or use incognito mode
3. Navigate to MLA Dashboard
4. The heatmap should now show the Mapbox map

## Troubleshooting

### Still showing "token not configured"?

1. **Check deployment status**
   - Go to Render dashboard → Your service → Events
   - Make sure the latest deployment is "Live"

2. **Verify environment variable**
   - Go to Environment tab
   - Confirm `NEXT_PUBLIC_MAPBOX_TOKEN` is listed
   - The value should start with `pk.eyJ`

3. **Clear browser cache**
   - Mobile: Use incognito/private mode
   - Desktop: Hard refresh (Ctrl+Shift+R)

4. **Check browser console**
   - Open developer tools (F12)
   - Look for any errors related to Mapbox

5. **Manual redeploy**
   - Go to your service → Manual Deploy → Deploy latest commit

## What You'll See After Setup

Once configured correctly, the heatmap will display:
- Interactive Mapbox map
- Blue to red color gradient showing complaint density
- Zoom and pan controls
- Legend showing density levels
- Auto-updates every 30 seconds

## Important Notes

- The token MUST start with `NEXT_PUBLIC_` to work in Next.js
- This is a public token and safe to use in frontend
- Don't commit the actual token value to GitHub
- The token is already in your `.env.local` for local development
