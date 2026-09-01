"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, Layer, Source } from 'react-map-gl/mapbox';
import { MapPin, Map as MapIcon, Satellite, Layers, Mountain } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Map style options
const MAP_STYLES = {
    streets: {
        id: 'streets',
        name: 'Streets',
        url: 'mapbox://styles/mapbox/streets-v12',
        icon: MapIcon
    },
    satellite: {
        id: 'satellite',
        name: 'Satellite',
        url: 'mapbox://styles/mapbox/satellite-streets-v12',
        icon: Satellite
    },
    terrain: {
        id: 'terrain',
        name: 'Terrain',
        url: 'mapbox://styles/mapbox/outdoors-v12',
        icon: Mountain
    },
    dark: {
        id: 'dark',
        name: 'Dark',
        url: 'mapbox://styles/mapbox/dark-v11',
        icon: Layers
    }
};

interface CivicMapboxProps {
    center?: [number, number];
    zoom?: number;
    onLocationSelect?: (lat: number, lon: number) => void;
    markers?: Array<{ lat: number; lon: number; label?: string; color?: string }>;
    interactive?: boolean;
    style?: string;
    showStyleSwitcher?: boolean;
    show3DToggle?: boolean;
}

export default function CivicMapbox({
    center,
    zoom = 13,
    onLocationSelect,
    markers = [],
    interactive = true,
    style = 'mapbox://styles/mapbox/streets-v12',
    showStyleSwitcher = true,
    show3DToggle = true
}: CivicMapboxProps) {
    const actualCenter = center && center[0] !== undefined ? center : [77.5946, 12.9716];
    const [viewState, setViewState] = useState({
        longitude: actualCenter[0],
        latitude: actualCenter[1],
        zoom: zoom,
        pitch: 0,
        bearing: 0
    });
    
    const [selectedLocation, setSelectedLocation] = useState<{ lng: number; lat: number } | null>(
        interactive ? { lng: center[0], lat: center[1] } : null
    );
    
    const [currentStyle, setCurrentStyle] = useState(style);
    const [is3DMode, setIs3DMode] = useState(false);
    const [showStyleMenu, setShowStyleMenu] = useState(false);
    
    const mapRef = useRef<any>(null);

    // Update view when center prop changes
    useEffect(() => {
        const effCenter = center && center[0] !== undefined ? center : [77.5946, 12.9716];
        setViewState(prev => ({
            ...prev,
            longitude: effCenter[0],
            latitude: effCenter[1],
            zoom: zoom
        }));
        if (interactive) {
            setSelectedLocation({ lng: effCenter[0], lat: effCenter[1] });
        }
    }, [center, zoom, interactive]);

    // Enable 3D terrain when map loads
    useEffect(() => {
        if (mapRef.current && is3DMode) {
            const map = mapRef.current.getMap();
            map.once('style.load', () => {
                if (!map.getSource('mapbox-dem')) {
                    map.addSource('mapbox-dem', {
                        type: 'raster-dem',
                        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                        tileSize: 512,
                        maxzoom: 14
                    });
                    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
                }
            });
        }
    }, [is3DMode, currentStyle]);

    const handleMapClick = useCallback((event: any) => {
        if (!interactive) return;
        
        const { lng, lat } = event.lngLat;
        setSelectedLocation({ lng, lat });
        
        if (onLocationSelect) {
            onLocationSelect(lat, lng);
        }
    }, [interactive, onLocationSelect]);

    const toggle3DMode = useCallback(() => {
        setIs3DMode(prev => {
            const newMode = !prev;
            setViewState(prev => ({
                ...prev,
                pitch: newMode ? 60 : 0,
                bearing: newMode ? -17.6 : 0
            }));
            
            if (mapRef.current) {
                const map = mapRef.current.getMap();
                if (newMode) {
                    // Enable 3D terrain
                    if (!map.getSource('mapbox-dem')) {
                        map.addSource('mapbox-dem', {
                            type: 'raster-dem',
                            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                            tileSize: 512,
                            maxzoom: 14
                        });
                    }
                    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
                } else {
                    // Disable 3D terrain
                    map.setTerrain(null);
                }
            }
            
            return newMode;
        });
    }, []);

    const changeMapStyle = useCallback((styleUrl: string) => {
        setCurrentStyle(styleUrl);
        setShowStyleMenu(false);
    }, []);

    if (!MAPBOX_TOKEN) {
        return (
            <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center p-4 border border-gray-200">
                <div className="text-center">
                    <MapIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">Map View Unavailable</p>
                    <p className="text-xs text-gray-400 mt-1">Mapbox token is missing from environment variables</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative">
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                onClick={handleMapClick}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle={currentStyle}
                scrollZoom={interactive}
                dragPan={interactive}
                dragRotate={is3DMode}
                pitchWithRotate={is3DMode}
                touchZoomRotate={interactive}
                ref={mapRef}
                terrain={is3DMode ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
            >
                {/* Style Switcher */}
                {showStyleSwitcher && (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="relative">
                            <button
                                onClick={() => setShowStyleMenu(!showStyleMenu)}
                                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 transition-all"
                            >
                                <Layers className="w-4 h-4" />
                                <span className="text-sm font-medium">Map Style</span>
                            </button>
                            
                            {showStyleMenu && (
                                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[160px]">
                                    {Object.values(MAP_STYLES).map((mapStyle) => {
                                        const Icon = mapStyle.icon;
                                        return (
                                            <button
                                                key={mapStyle.id}
                                                onClick={() => changeMapStyle(mapStyle.url)}
                                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                                                    currentStyle === mapStyle.url ? 'bg-civic-blue/10 text-civic-blue' : 'text-gray-700'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{mapStyle.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3D Toggle */}
                {show3DToggle && (
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={toggle3DMode}
                            className={`px-4 py-2 rounded-lg shadow-lg border transition-all flex items-center gap-2 ${
                                is3DMode 
                                    ? 'bg-civic-blue text-white border-civic-blue' 
                                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                        >
                            <Mountain className="w-4 h-4" />
                            <span className="text-sm font-medium">{is3DMode ? '3D View' : '2D View'}</span>
                        </button>
                    </div>
                )}

                {/* Navigation Controls */}
                {interactive && (
                    <>
                        <NavigationControl position="bottom-right" showCompass={is3DMode} />
                        <GeolocateControl
                            position="bottom-right"
                            trackUserLocation
                            onGeolocate={(e) => {
                                if (onLocationSelect) {
                                    onLocationSelect(e.coords.latitude, e.coords.longitude);
                                }
                                setSelectedLocation({ 
                                    lng: e.coords.longitude, 
                                    lat: e.coords.latitude 
                                });
                            }}
                        />
                    </>
                )}

                {/* Selected Location Marker (for interactive mode) */}
                {interactive && selectedLocation && (
                    <Marker
                        longitude={selectedLocation.lng}
                        latitude={selectedLocation.lat}
                        anchor="bottom"
                    >
                        <div className="relative">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-civic-blue text-white px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg">
                                Selected Location
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-civic-blue"></div>
                            </div>
                            <MapPin className="w-10 h-10 text-civic-blue drop-shadow-lg" fill="currentColor" />
                        </div>
                    </Marker>
                )}

                {/* Custom Data Markers */}
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        longitude={marker.lon}
                        latitude={marker.lat}
                        anchor="bottom"
                    >
                        <div className="relative group">
                            {marker.label && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    {marker.label}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                </div>
                            )}
                            <MapPin 
                                className="w-8 h-8 drop-shadow-lg transition-transform group-hover:scale-110" 
                                fill={marker.color || '#EF4444'} 
                                color={marker.color || '#EF4444'}
                            />
                        </div>
                    </Marker>
                ))}
            </Map>
        </div>
    );
}
