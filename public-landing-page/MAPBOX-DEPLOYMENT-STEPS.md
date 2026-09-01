# Mapbox Migration - Deployment Steps

## ✅ Completed
1. Installed mapbox-gl and react-map-gl packages
2. Created CivicMapbox component at `src/components/ui/CivicMapbox.tsx`
3. Updated all pages to use Mapbox instead of Leaflet:
   - `src/app/citizen/report/page.tsx`
   - `src/app/admin/complaints/[id]/page.tsx`
   - `src/app/officer/tasks/[id]/page.tsx`
   - `src/app/mla/issues/[id]/page.tsx`
4. Created `.env.local` with Mapbox token
5. Removed hardcoded token from code
6. Pushed changes to GitHub

## 🚀 Next Steps

### Step 1: Add Environment Variable to Render

1. Go to https://dashboard.render.com
2. Select your frontend service: **civicpath-frontend**
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `NEXT_PUBLIC_MAPBOX_TOKEN`
   - **Value**: `[Your Mapbox token from .env.local file]`
6. Click **Save Changes**

### Step 2: Deploy Frontend

Since the code is already pushed to GitHub, Render will auto-deploy. However, to ensure the environment variable is picked up:

1. Go to **Manual Deploy** section
2. Click **Clear build cache & deploy**
3. Wait for deployment to complete (~5-10 minutes)

### Step 3: Test the Maps

After deployment, test all map pages:

1. **Citizen Report Page**: https://civicpath-frontend.onrender.com/citizen/report
   - Click on map to select location
   - Verify marker appears
   - Test geolocation button

2. **Admin Complaint Details**: https://civicpath-frontend.onrender.com/admin/complaints/[id]
   - Verify complaint location shows on map
   - Check marker displays correctly

3. **Officer Task Details**: https://civicpath-frontend.onrender.com/officer/tasks/[id]
   - Verify task location shows on map

4. **MLA Issue Details**: https://civicpath-frontend.onrender.com/mla/issues/[id]
   - Verify issue location shows on map

### Step 4: Optional Cleanup (After Confirming Mapbox Works)

Once you've confirmed Mapbox is working correctly, you can remove Leaflet dependencies:

```bash
npm uninstall leaflet react-leaflet @types/leaflet
```

Then commit and push:
```bash
git add package.json package-lock.json
git commit -m "Remove Leaflet dependencies after Mapbox migration"
git push
```

## 🎯 Key Differences from Leaflet

### Coordinate Order
- **Leaflet**: [latitude, longitude]
- **Mapbox**: [longitude, latitude]

All pages have been updated to use the correct order.

### Map Styles
Mapbox uses style URLs:
- Streets: `mapbox://styles/mapbox/streets-v12` (current)
- Satellite: `mapbox://styles/mapbox/satellite-v9`
- Dark: `mapbox://styles/mapbox/dark-v11`
- Light: `mapbox://styles/mapbox/light-v11`

### Features
- Hardware-accelerated rendering (faster)
- Better mobile touch support
- Smooth zoom and pan animations
- Built-in geolocation control
- Navigation controls (zoom in/out)

## 📊 Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| CivicMapbox Component | ✅ Created | Replaces CivicMap |
| Citizen Report Page | ✅ Updated | Interactive map with location selection |
| Admin Complaint Details | ✅ Updated | Display-only map with complaint marker |
| Officer Task Details | ✅ Updated | Display-only map with task marker |
| MLA Issue Details | ✅ Updated | Display-only map with issue marker |
| Environment Variable | ⏳ Pending | Add to Render |
| Frontend Deployment | ⏳ Pending | Deploy with env var |
| Testing | ⏳ Pending | Test all map pages |
| Leaflet Cleanup | ⏳ Optional | Remove after testing |

## 🔧 Troubleshooting

### Map Not Loading
- Check browser console for errors
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set in Render
- Ensure frontend was deployed with "Clear build cache"

### Wrong Location Displayed
- Verify coordinate order is [longitude, latitude]
- Check that center prop is passed correctly

### Geolocation Not Working
- Ensure HTTPS is enabled (Render provides this)
- Check browser permissions for location access

## 📝 Files Modified

- `src/components/ui/CivicMapbox.tsx` (new)
- `src/app/citizen/report/page.tsx`
- `src/app/admin/complaints/[id]/page.tsx`
- `src/app/officer/tasks/[id]/page.tsx`
- `src/app/mla/issues/[id]/page.tsx`
- `.env.local` (local only, not in git)
- `package.json` (added mapbox-gl, react-map-gl)
