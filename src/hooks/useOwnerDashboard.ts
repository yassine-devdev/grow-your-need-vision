import { useQuery } from '@tanstack/react-query';
import { ownerService } from '../services/ownerService';

export const useOwnerDashboard = () => {
    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['ownerDashboard'],
        queryFn: () => ownerService.getDashboardData(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });

    return {
        data: data || null,
        loading: isLoading,
        error: error ? (error as Error).message : null,
        refreshing: isRefetching,
        refresh: refetch
    };
};
