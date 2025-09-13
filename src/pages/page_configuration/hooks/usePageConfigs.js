import { useQuery } from "@tanstack/react-query";
import { fetchAllPageConfigs } from "../helpers/pageConfigApi";

export const usePageConfigs = () => {
    return useQuery({
        queryKey: ["pageConfigs"],
        queryFn: fetchAllPageConfigs,
        select: (data) => {
            // Handle API response structure - the API returns a single object, not an array
            const responseData = data?.response?.data || data?.data;
            
            // If it's a single object, wrap it in an array
            if (responseData && !Array.isArray(responseData)) {
                return [responseData];
            }
            
            // If it's already an array, return it
            return responseData || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}; 