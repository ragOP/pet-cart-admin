import { useQuery } from '@tanstack/react-query';
import { fetchContentData } from '../helpers/fetchContentData';
import { toast } from 'sonner';

export const useContentData = (contentType, params = {}) => {
  return useQuery({
    queryKey: ['contentData', contentType, params],
    queryFn: async () => {
      const response = await fetchContentData(contentType, params);
      
      // Handle API response and show errors in toast
      if (!response.success) {
        const errorMessage = response.error || 'Failed to fetch data';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      return response;
    },
    enabled: !!contentType, // Only run query when contentType is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}; 