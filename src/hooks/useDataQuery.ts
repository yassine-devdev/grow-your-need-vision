import { useState, useEffect, useCallback, useRef } from 'react';
import pb from '../lib/pocketbase';
import { ListResult } from 'pocketbase';

export interface DataQueryOptions {
    page?: number;
    perPage?: number;
    sort?: string;
    filter?: string;
    expand?: string;
    fields?: string;
}

export interface DataQueryResult<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    loading: boolean;
    error: Error | null;
    page: number;
    perPage: number;
    sort: string;
    filter: string;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    setSort: (sort: string) => void;
    setFilter: (filter: string) => void;
    refresh: () => Promise<void>;
    exportData: (filename?: string) => Promise<void>;
}

export function useDataQuery<T = any>(
    collectionName: string, 
    initialOptions: DataQueryOptions = {}
): DataQueryResult<T> {
    const [items, setItems] = useState<T[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    const [page, setPage] = useState(initialOptions.page || 1);
    const [perPage, setPerPage] = useState(initialOptions.perPage || 20);
    const [sort, setSort] = useState(initialOptions.sort || '-created');
    const [filter, setFilter] = useState(initialOptions.filter || '');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Debounce filter changes
    const [debouncedFilter, setDebouncedFilter] = useState(filter);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilter(filter);
            setPage(1); // Reset to page 1 on filter change
        }, 500);
        return () => clearTimeout(handler);
    }, [filter]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await pb.collection(collectionName).getList<T>(page, perPage, {
                sort,
                filter: debouncedFilter,
                expand: initialOptions.expand,
                fields: initialOptions.fields,
                requestKey: null // Disable auto-cancellation for this specific request if needed, or keep it to avoid race conditions
            });
            
            setItems(result.items);
            setTotalItems(result.totalItems);
            setTotalPages(result.totalPages);
        } catch (err: any) {
            console.error(`Error fetching data from ${collectionName}:`, err);
            setError(err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [collectionName, page, perPage, sort, debouncedFilter, initialOptions.expand, initialOptions.fields]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refresh = async () => {
        await fetchData();
    };

    const exportData = async (filename = 'export.csv') => {
        try {
            // Fetch all data matching current filter/sort
            const result = await pb.collection(collectionName).getFullList<T>({
                sort,
                filter: debouncedFilter,
                expand: initialOptions.expand,
                fields: initialOptions.fields,
            });

            if (!result.length) return;

            // Convert to CSV
            const headers = Object.keys(result[0] as object).join(',');
            const rows = result.map(row => 
                Object.values(row as object).map(val => 
                    typeof val === 'object' ? JSON.stringify(val) : String(val)
                ).join(',')
            );
            const csvContent = [headers, ...rows].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed. See console for details.");
        }
    };

    return {
        items,
        totalItems,
        totalPages,
        loading,
        error,
        page,
        perPage,
        sort,
        filter,
        setPage,
        setPerPage,
        setSort,
        setFilter,
        refresh,
        exportData
    };
}
