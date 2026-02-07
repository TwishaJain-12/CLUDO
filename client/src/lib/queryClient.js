import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query Client Configuration
 * Provides global caching, automatic background refetching, and deduplication
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is fresh for 2 minutes
            staleTime: 2 * 60 * 1000,
            // Keep cached data for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests once
            retry: 1,
            // Don't refetch on window focus in development
            refetchOnWindowFocus: false,
        },
    },
});
