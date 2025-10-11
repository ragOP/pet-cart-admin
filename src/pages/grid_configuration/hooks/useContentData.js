import { useQuery } from '@tanstack/react-query';
import { fetchContentData } from '../helpers/fetchContentData';
import { toast } from 'sonner';

export const useContentData = (contentType, params = {}) => {
  // Create a stable query key by serializing params
  const queryKey = [
    'contentData', 
    contentType, 
    params.page || 1,
    params.per_page || params.limit || 50,
    params.search || 'all' // Use 'all' instead of undefined for better cache key differentiation
  ];

  return useQuery({
    queryKey,
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
    staleTime: 30 * 1000, // 30 seconds - reduced for better search UX
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}; 