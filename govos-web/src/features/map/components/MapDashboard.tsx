import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mapApi } from '../api/api';
import { useUiStore } from '../../../store/ui.store';
import { MapPin, Search, Filter } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons based on type
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const complaintIcon = createCustomIcon('#ef4444'); // Red
const assetIcon = createCustomIcon('#3b82f6'); // Blue
const projectIcon = createCustomIcon('#eab308'); // Yellow

export default function MapDashboard() {
  const { setActiveModule } = useUiStore();
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  
  useEffect(() => {
    setActiveModule('map');
  }, [setActiveModule]);

  const { data: features } = useQuery({
    queryKey: ['map-features'],
    queryFn: () => mapApi.getFeatures(),
  });

  const complaintCount = features?.filter(f => f.type === 'COMPLAINT').length ?? 0;
  const assetCount = features?.filter(f => f.type === 'ASSET').length ?? 0;
  const projectCount = features?.filter(f => f.type === 'PROJECT').length ?? 0;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'COMPLAINT': return complaintIcon;
      case 'ASSET': return assetIcon;
      case 'PROJECT': return projectIcon;
      default: return new L.Icon.Default();
    }
  };

  const filteredFeatures = activeFilter === 'ALL' 
    ? features 
    : features?.filter(f => f.type === activeFilter);

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Floating Control Panel */}
      <div className="absolute top-6 left-6 z-[1000] bg-card border border-border shadow-lg rounded-xl p-4 w-80">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 mb-4">
          <MapPin className="text-govos-blue" />
          Geospatial Intelligence
        </h2>
        
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search location or ward..." 
            className="w-full pl-9 pr-4 py-2 bg-secondary rounded-md text-sm border-transparent focus:border-govos-blue focus:ring-1 focus:ring-govos-blue transition-all"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Filter size={12} /> Map Layers
          </h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveFilter('ALL')}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${activeFilter === 'ALL' ? 'bg-govos-blue/10 text-govos-blue font-medium' : 'hover:bg-secondary text-muted-foreground'}`}
            >
              All Layers <span className="text-xs opacity-70">({complaintCount + assetCount + projectCount})</span>
            </button>
            <button 
              onClick={() => setActiveFilter('COMPLAINT')}
              className={`text-left px-3 py-2 rounded-md text-sm flex items-center justify-between gap-2 transition-colors ${activeFilter === 'COMPLAINT' ? 'bg-red-500/10 text-red-500 font-medium' : 'hover:bg-secondary text-muted-foreground'}`}
            >
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Active Complaints</span>
              <span className="text-xs font-mono bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">{complaintCount}</span>
            </button>
            <button 
              onClick={() => setActiveFilter('ASSET')}
              className={`text-left px-3 py-2 rounded-md text-sm flex items-center justify-between gap-2 transition-colors ${activeFilter === 'ASSET' ? 'bg-blue-500/10 text-blue-500 font-medium' : 'hover:bg-secondary text-muted-foreground'}`}
            >
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Infrastructure Assets</span>
              <span className="text-xs font-mono bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">{assetCount}</span>
            </button>
            <button 
              onClick={() => setActiveFilter('PROJECT')}
              className={`text-left px-3 py-2 rounded-md text-sm flex items-center justify-between gap-2 transition-colors ${activeFilter === 'PROJECT' ? 'bg-yellow-500/10 text-yellow-600 font-medium' : 'hover:bg-secondary text-muted-foreground'}`}
            >
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Civic Projects</span>
              <span className="text-xs font-mono bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded">{projectCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full bg-secondary relative z-0">
        <MapContainer 
          center={[19.0760, 72.8777]} // Mumbai coordinates as default
          zoom={13} 
          zoomControl={false}
          className="h-full w-full"
        >
          {/* Dark theme tiles for premium feel */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          
          {filteredFeatures?.map((feature) => (
            <Marker 
              key={feature.id} 
              position={[feature.latitude, feature.longitude]}
              icon={getIconForType(feature.type)}
            >
              <Popup className="govos-popup">
                <div className="p-1">
                  <div className="text-xs font-mono text-muted-foreground mb-1">{feature.type}</div>
                  <h3 className="font-semibold text-sm m-0">{feature.title}</h3>
                  <div className={`mt-2 text-xs font-medium ${feature.severity === 'HIGH' ? 'text-red-500' : 'text-amber-500'}`}>
                    Severity: {feature.severity}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bottom stats overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-card/90 backdrop-blur-sm border border-border rounded-2xl px-6 py-3 shadow-xl">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Complaints:</span>
          <span className="font-bold">{complaintCount}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Assets:</span>
          <span className="font-bold">{assetCount}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Projects:</span>
          <span className="font-bold">{projectCount}</span>
        </div>
        {activeFilter !== 'ALL' && (
          <>
            <div className="w-px h-4 bg-border" />
            <span className="text-xs text-govos-blue font-medium">
              Showing {filteredFeatures?.length ?? 0} filtered
            </span>
          </>
        )}
      </div>
    </div>
  );
}
