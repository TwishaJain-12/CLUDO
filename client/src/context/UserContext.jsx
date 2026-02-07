import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { userApi, setTokenProvider } from '../services/api';

/**
 * User Context
 * Manages user state and syncs with backend
 */

const UserContext = createContext();

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const { isSignedIn, getToken } = useAuth();
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sync user with backend when signed in
    useEffect(() => {
        // Register the token provider with the API service
        // This allows axios to get a fresh token for every request
        setTokenProvider(getToken);

        const syncUserWithBackend = async () => {
            if (!clerkLoaded) return;

            if (isSignedIn && clerkUser) {
                try {
                    setLoading(true);
                    setError(null);

                    // We don't need to manually get token here anymore as the interceptor handles it
                    // But we still store it in localStorage for non-axios usage if any
                    const token = await getToken();
                    if (token) {
                        localStorage.setItem('clerk-token', token);
                    }

                    // Sync user with backend
                    const response = await userApi.syncUser();
                    setUser(response.data.data);
                } catch (err) {
                    console.error('Error syncing user:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            } else {
                // Clear user data when signed out
                setUser(null);
                localStorage.removeItem('clerk-token');
                setLoading(false);
            }
        };

        syncUserWithBackend();
    }, [isSignedIn, clerkUser, clerkLoaded, getToken]);

    // Refresh token periodically
    useEffect(() => {
        if (!isSignedIn) return;

        const refreshToken = async () => {
            try {
                const token = await getToken();
                if (token) {
                    localStorage.setItem('clerk-token', token);
                }
            } catch (err) {
                console.error('Error refreshing token:', err);
            }
        };

        // Refresh token every 50 minutes (Clerk tokens expire in ~1 hour)
        const interval = setInterval(refreshToken, 50 * 60 * 1000);

        return () => clearInterval(interval);
    }, [isSignedIn, getToken]);

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    // Refresh user data
    const refreshUser = async () => {
        try {
            const response = await userApi.getMe();
            setUser(response.data.data);
        } catch (err) {
            console.error('Error refreshing user:', err);
        }
    };

    const value = {
        user,
        loading: loading || !clerkLoaded,
        error,
        isAdmin,
        isSignedIn,
        refreshUser,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
