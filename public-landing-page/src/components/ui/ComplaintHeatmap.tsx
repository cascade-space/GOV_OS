"use client";
import { useEffect, useRef, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import type { HeatmapLayer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const heatmapLayer: HeatmapLayer = {
    id: 'complaints-heat',
    type: 'heatmap',
    paint: {
        // Increase weight as complaint density increases
        'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'priority'],
            0, 0.5,
            1, 1
        ],
        // Increase intensity as zoom level increases
        'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
        ],
        // Color ramp for heatmap
        'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
        ],
        // Adjust the heatmap radius by zoom level
        'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            15, 20
        ],
        // Transition from heatmap to circle layer by zoom level
        'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            15, 0.5
        ]
    }
};

interface ComplaintHeatmapProps {
    height?: string;
}

export default function ComplaintHeatmap({ height = '400px' }: ComplaintHeatmapProps) {
    const [geojsonData, setGeojsonData] = useState<any>(null);
    const [viewState, setViewState] = useState({
        longitude: 77.5946,
        latitude: 12.9716,
        zoom: 11
    });

    useEffect(() => {
        fetchComplaintLocations();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchComplaintLocations, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchComplaintLocations = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1/mla/complaint-locations');
            const data = await response.json();
            if (data.success && data.data.features.length > 0) {
                setGeojsonData(data.data);
                
                // Center map on first complaint if available
                const firstFeature = data.data.features[0];
                if (firstFeature) {
                    setViewState(prev => ({
                        ...prev,
                        longitude: firstFeature.geometry.coordinates[0],
                        latitude: firstFeature.geometry.coordinates[1]
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching complaint locations:', error);
        }
    };

    if (!MAPBOX_TOKEN) {
        return (
            <div className="w-full bg-gray-100 rounded-2xl flex items-center justify-center p-4" style={{ height }}>
                <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">Mapbox token not configured</p>
                    <p className="text-xs text-gray-400">Add NEXT_PUBLIC_MAPBOX_TOKEN to environment variables</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height }}>
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
            >
                {geojsonData && (
                    <Source type="geojson" data={geojsonData}>
                        <Layer {...heatmapLayer} />
                    </Source>
                )}
            </Map>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <p className="text-xs font-bold text-gray-700 mb-2">Complaint Density</p>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <div className="w-4 h-4 rounded" style={{ background: 'rgb(103,169,207)' }}></div>
                        <div className="w-4 h-4 rounded" style={{ background: 'rgb(253,219,199)' }}></div>
                        <div className="w-4 h-4 rounded" style={{ background: 'rgb(239,138,98)' }}></div>
                        <div className="w-4 h-4 rounded" style={{ background: 'rgb(178,24,43)' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 w-full">
                        <span>Low</span>
                        <span>High</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
