import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { apiRequest } from '@shared/utils/api-client';

export function usePaginatedFetch({
  baseURL,
  endpoint,
  defaultParams = {},
  extractData,
  searchQuery,
  limit,
}) {
  const [data, setData] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSetSearch = useCallback(
    debounce(query => setDebouncedQuery(query), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);
    return () => debouncedSetSearch.cancel();
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest({
          baseURL,
          endpoint,
          method: 'GET',
          params: {
            ...defaultParams,
            search_query: debouncedQuery,
            page: pagination.currentPage,
            limit,
          },
          signal: controller.signal,
        });

        if (!isMounted) return;
        const { items, totalPages, totalCount } = extractData(response);
        setData(items);
        setPagination(prev => ({ ...prev, totalPages, totalCount: totalCount || 0 }));
      } catch (err) {
        if (!isMounted || err.name === 'AbortError') return;
        setError('Failed to load data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pagination.currentPage, debouncedQuery]);

  return {
    data,
    loading,
    error,
    pagination,
    setPagination,
    currentPage: pagination.currentPage,
    setCurrentPage: page =>
      setPagination(prev => ({ ...prev, currentPage: page })),
  };
}
