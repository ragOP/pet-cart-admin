import { apiService } from "@/api/api_services";

export const fetchSubscribers = async ({ params } = {}) => {
  const { response, error } = await apiService({
    endpoint: "api/news-letter/get-all-subscribers",
    method: "GET",
    params,
  });
  if (error || !response?.success) {
    throw new Error(response?.message || "Failed to fetch subscribers");
  }
  return response;
}; 