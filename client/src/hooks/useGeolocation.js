import { useState, useEffect } from 'react';

/**
 * Custom hook for getting user's geolocation
 */
export const useGeolocation = (options = {}) => {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
                setLoading(false);
            },
            (err) => {
                let errorMessage = 'Unable to retrieve your location';

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access.';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }

                setError(errorMessage);
                setLoading(false);
            },
            defaultOptions
        );
    };

    // Get location on mount if autoFetch is true
    useEffect(() => {
        if (options.autoFetch) {
            getLocation();
        }
    }, []);

    return {
        position,
        error,
        loading,
        getLocation,
        isSupported: !!navigator.geolocation,
    };
};

export default useGeolocation;
