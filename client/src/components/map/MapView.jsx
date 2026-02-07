import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { issueApi } from '../../services/api';
import { statusConfig, categoryConfig, formatRelativeTime } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';
import Loader from '../common/Loader';
import { Link } from 'react-router-dom';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons based on status
const createCustomIcon = (status) => {
    const colors = {
        reported: '#ef4444',
        in_progress: '#f59e0b',
        resolved: '#10b981',
    };

    return L.divIcon({
        className: 'custom-marker-icon',
        html: `
      <div style="
        width: 30px;
        height: 30px;
        background: ${colors[status] || colors.reported};
        border: 3px solid #1e293b;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      "></div>
    `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
    });
};

// Map center updater component
const MapCenterUpdater = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, 13);
        }
    }, [center, map]);

    return null;
};

/**
 * Map View Component
 * Displays issues on an interactive map
 */
const MapView = ({ filters = {}, onIssueClick, height = '100%' }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [center, setCenter] = useState([20.5937, 78.9629]); // Default: India center
    const [userLocation, setUserLocation] = useState(null);

    // Fetch issues for map
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                setLoading(true);
                const response = await issueApi.getIssuesForMap(filters);
                setIssues(response.data.data);

                // Center map on first issue if available
                if (response.data.data.length > 0) {
                    const firstIssue = response.data.data[0];
                    if (firstIssue.location?.coordinates) {
                        setCenter([
                            firstIssue.location.coordinates[1],
                            firstIssue.location.coordinates[0],
                        ]);
                    }
                }
            } catch (error) {
                console.error('Error fetching map issues:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [filters]);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setCenter([latitude, longitude]);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                },
                { enableHighAccuracy: true }
            );
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-dark-800">
                <Loader text="Loading map..." />
            </div>
        );
    }

    return (
        <div style={{ height }} className="w-full rounded-xl overflow-hidden">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapCenterUpdater center={center} />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={L.divIcon({
                            className: 'user-location-marker',
                            html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #3b82f6;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 0 10px rgba(59,130,246,0.5);
                "></div>
              `,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10],
                        })}
                    >
                        <Popup>
                            <div className="text-dark-900 font-medium">Your Location</div>
                        </Popup>
                    </Marker>
                )}

                {/* Issue Markers */}
                {issues.map((issue) => {
                    if (!issue.location?.coordinates) return null;

                    const [lng, lat] = issue.location.coordinates;
                    const category = categoryConfig[issue.category] || categoryConfig.other;

                    return (
                        <Marker
                            key={issue._id}
                            position={[lat, lng]}
                            icon={createCustomIcon(issue.status)}
                            eventHandlers={{
                                click: () => onIssueClick && onIssueClick(issue),
                            }}
                        >
                            <Popup maxWidth={300}>
                                <div className="p-2">
                                    <h4 className="font-semibold text-dark-900 mb-2">
                                        {issue.title}
                                    </h4>

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded ${category.bg} ${category.color}`}
                                        >
                                            {category.label}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded ${statusConfig[issue.status]?.bg
                                                } ${statusConfig[issue.status]?.color}`}
                                        >
                                            {statusConfig[issue.status]?.label}
                                        </span>
                                    </div>

                                    <p className="text-dark-600 text-sm mb-2">
                                        {formatRelativeTime(issue.createdAt)} · {issue.upvotesCount} upvotes
                                    </p>

                                    <Link
                                        to={`/issues/${issue._id}`}
                                        className="text-primary-600 text-sm font-medium hover:underline"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapView;
