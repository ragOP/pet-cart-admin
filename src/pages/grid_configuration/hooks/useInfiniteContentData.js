import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchContentData } from '../helpers/fetchContentData';
import { toast } from 'sonner';

export const useInfiniteContentData = (contentType, searchTerm = '') => {
  return useInfiniteQuery({
    queryKey: ['contentData', contentType, searchTerm || 'all'],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        per_page: 50,
        page: pageParam,
        search: searchTerm || undefined,
      };

      const response = await fetchContentData(contentType, params);
      
      // Handle API response and show errors in toast
      if (!response.success) {
        const errorMessage = response.error || 'Failed to fetch data';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      // Extract data from response
      let contentData = lastPage?.data?.data || lastPage?.data || [];
      let totalCount;
      
      if (contentType === "category") {
        contentData = lastPage?.data?.data?.categories || [];
        // For categories, total is nested in data.data.total
        totalCount = lastPage?.data?.data?.total || contentData.length;
      } else {
        // For other types, total is in data.total
        totalCount = lastPage?.data?.total || lastPage?.data?.length || contentData.length;
      }
      
      const currentCount = allPages.reduce((acc, page) => {
        let pageData = page?.data?.data || page?.data || [];
        if (contentType === "category") {
          pageData = page?.data?.data?.categories || [];
        }
        return acc + (pageData?.length || 0);
      }, 0);
      
      // Return next page number if there are more items, otherwise undefined
      return currentCount < totalCount ? allPages.length + 1 : undefined;
    },
    enabled: !!contentType,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

