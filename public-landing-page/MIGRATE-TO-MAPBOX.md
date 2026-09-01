# Migrate from Leaflet to Mapbox

## Step 1: Install Mapbox Dependencies

Run these commands:

```bash
npm install mapbox-gl react-map-gl
npm install --save-dev @types/mapbox-gl
```

## Step 2: Get Mapbox Access Token

1. Go to https://www.mapbox.com/
2. Sign up for a free account
3. Go to Account → Access Tokens
4. Copy your default public token
5. Add to your `.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Step 3: Uninstall Leaflet (After Mapbox is working)

```bash
npm uninstall leaflet react-leaflet @types/leaflet
```

## Why Mapbox?

### Advantages over Leaflet
- **Better Performance**: Hardware-accelerated rendering
- **Modern Design**: Sleek, professional map styles
- **3D Support**: Terrain, buildings, and custom 3D layers
- **Better Mobile**: Optimized for touch devices
- **Vector Tiles**: Faster loading, smoother zooming
- **Custom Styling**: Full control over map appearance
- **Better Documentation**: More examples and support

### Mapbox Features
- Multiple map styles (streets, satellite, dark, light)
- Real-time traffic data
- Geocoding and directions API
- Heatmaps and data visualization
- Custom markers and popups
- Smooth animations and transitions

## Next Steps

After running the install command, I'll create the new Mapbox component for you.
