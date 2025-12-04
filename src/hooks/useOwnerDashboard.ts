import { useState, useEffect, useCallback } from 'react';
import { ownerService, OwnerDashboardData } from '../services/ownerService';

export const useOwnerDashboard = () => {
    const [data, setData] = useState<OwnerDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            // Only set loading if we don't have data yet
            if (!data) setLoading(true);
        }
        
        try {
            console.log("Fetching dashboard data...");
            const dashboardData = await ownerService.getDashboardData();
            console.log("Dashboard data received:", dashboardData ? "Yes" : "No");
            setData(dashboardData);
            setError(null);
        } catch (err: unknown) {
            console.error("Dashboard fetch error:", err);
            // Ignore auto-cancellation errors
            const pbError = err as { status?: number; isAbort?: boolean; message?: string };
            if (pbError.status === 0 || pbError.isAbort) {
                console.log("Request cancelled, ignoring...");
                return;
            }
            console.error("Failed to fetch owner dashboard data:", err);
            // Only set error if we don't have data, otherwise just show toast (in a real app)
            if (!data) {
                setError("Failed to load dashboard data. Please try again.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []); // Remove data dependency to prevent infinite loop

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refreshing,
        refresh: () => fetchData(true)
    };
};
