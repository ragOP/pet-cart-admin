import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchContentData = async (contentType, params = {}) => {
  try {
    let endpoint;
    
    switch (contentType) {
      case 'product':
        endpoint = endpoints.product;
        break;
      case 'category':
        endpoint = endpoints.category;
        break;
      case 'subCategory':
        endpoint = endpoints.sub_category;
        break;
      case 'collection':
        endpoint = endpoints.collection;
        break;
      default:
        return { success: false, error: 'Invalid content type' };
    }

    const apiResponse = await apiService({
      endpoint,
      method: "GET",
      params,
    });

    // Return the entire API response for frontend handling
    return apiResponse?.response || { success: false, error: 'No response from API' };
  } catch (error) {
    console.error(`Error fetching ${contentType} data:`, error);
    return { success: false, error: error.message || 'Network error occurred' };
  }
}; 