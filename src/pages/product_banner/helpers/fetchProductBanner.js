import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchProductBanner = async (type = null) => {
  try {
    const params = {};
    
    // Only add type parameter if it's specified
    if (type) {
      params.type = type;
    }

    const apiResponse = await apiService({
      endpoint: `${endpoints.productBanner}/get`,
      method: "GET",
      params,
    });

    if (apiResponse?.response?.success) {
      return {
        success: true,
        data: apiResponse.response.data,
        message: apiResponse.response.message,
      };
    } else {
      console.log(apiResponse);
      return {
        success: false,
        data: null,
        message: apiResponse?.response?.data?.message || "Failed to fetch product banner",
      };
    }
  } catch (error) {
    console.error("Error fetching product banner:", error);
    return {
      success: false,
      data: null,
      message: "Failed to fetch product banner",
      error: error,
    };
  }
}; 