import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueApi, adminApi } from '../services/api';

/**
 * TanStack Query Hooks
 * These hooks provide caching, automatic refetching, and loading states
 */

// Query Keys
export const queryKeys = {
    issues: {
        all: ['issues'],
        list: (params) => ['issues', 'list', params],
        detail: (id) => ['issues', 'detail', id],
        user: () => ['issues', 'user'],
    },
    admin: {
        issues: (params) => ['admin', 'issues', params],
        reports: (params) => ['admin', 'reports', params],
        analytics: () => ['admin', 'analytics'],
        reportAnalytics: () => ['admin', 'reportAnalytics'],
    },
};

/**
 * Hook to fetch single issue by ID (with caching)
 */
export const useIssueQuery = (id) => {
    return useQuery({
        queryKey: queryKeys.issues.detail(id),
        queryFn: async () => {
            const response = await issueApi.getIssueById(id);
            return response.data.data;
        },
        enabled: !!id,
        staleTime: 60 * 1000, // 1 minute
    });
};

/**
 * Hook to fetch admin issues (with caching)
 */
export const useAdminIssues = (params) => {
    return useQuery({
        queryKey: queryKeys.admin.issues(params),
        queryFn: async () => {
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== '' && v !== undefined)
            );
            const response = await adminApi.getIssues(cleanParams);
            return response.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 30 * 1000, // 30 seconds for admin data
    });
};

/**
 * Hook to fetch admin reports (with caching)
 */
export const useAdminReports = (params) => {
    return useQuery({
        queryKey: queryKeys.admin.reports(params),
        queryFn: async () => {
            const response = await adminApi.getGroupedReports(params);
            return response.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 30 * 1000,
    });
};

/**
 * Hook to fetch analytics (with caching)
 */
export const useAnalytics = () => {
    return useQuery({
        queryKey: queryKeys.admin.analytics(),
        queryFn: async () => {
            const response = await adminApi.getAnalytics();
            return response.data.data;
        },
        staleTime: 60 * 1000,
    });
};

/**
 * Hook to fetch report analytics (with caching)
 */
export const useReportAnalytics = () => {
    return useQuery({
        queryKey: queryKeys.admin.reportAnalytics(),
        queryFn: async () => {
            const response = await adminApi.getReportAnalytics();
            return response.data.data;
        },
        staleTime: 60 * 1000,
    });
};

/**
 * Hook to invalidate queries after mutations
 */
export const useInvalidateQueries = () => {
    const queryClient = useQueryClient();

    return {
        invalidateIssues: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),
        invalidateAdminData: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
        invalidateAll: () => queryClient.invalidateQueries(),
    };
};
