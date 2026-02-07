import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Scan, Calendar, Layers } from 'lucide-react';

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    map.setView([lat, lng], map.getZoom());
    return null;
};

const SatelliteMap = ({ onLocationSelect, selectedLocation, isAnalyzing }) => {
    const [mapType, setMapType] = useState('satellite'); // 'satellite' or 'ndvi'
    const [year, setYear] = useState(2024);

    const handleMapClick = (e) => {
        // In a real implementation, we would get coordinates from map click
        // For now, we simulate selecting a location
        // const { lat, lng } = e.latlng;
        // onLocationSelect({ lat, lng });
    };

    // Custom tile layers
    const layers = {
        standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ndvi: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Placeholder for NDVI tiles (usually requires custom server or GEE)
    };

    return (
        <div className="relative h-full w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 text-slate-100 w-64">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" /> Layer Control
                </h3>
                <div className="flex gap-2 text-xs mb-3">
                    <button
                        onClick={() => setMapType('satellite')}
                        className={`flex-1 py-1 px-2 rounded ${mapType === 'satellite' ? 'bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                        RGB
                    </button>
                    <button
                        onClick={() => setMapType('ndvi')}
                        className={`flex-1 py-1 px-2 rounded ${mapType === 'ndvi' ? 'bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                        NDVI (Heatmap)
                    </button>
                </div>

                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" /> Time Machine
                </h3>
                <input
                    type="range"
                    min="2016"
                    max="2024"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>2016</span>
                    <span className="text-emerald-400 font-bold">{year}</span>
                    <span>2024</span>
                </div>
            </div>

            {isAnalyzing && (
                <div className="absolute inset-0 z-[1001] pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <Scan className="w-12 h-12 text-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 font-mono mt-2 bg-black/80 px-2 py-1 rounded">SCANNING SECTOR...</span>
                    </div>
                </div>
            )}

            <MapContainer
                center={[28.6139, 77.2090]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={mapType === 'ndvi' ? layers.ndvi : layers.satellite}
                />
                {selectedLocation && (
                    <>
                        <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
                        <RecenterMap lat={selectedLocation.lat} lng={selectedLocation.lng} />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default SatelliteMap;
