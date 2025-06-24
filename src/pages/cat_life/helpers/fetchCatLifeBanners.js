import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchCatLifeBanners = async (type = null) => {
  try {
    const params = {};
    
    // Only add type parameter if it's specified
    if (type) {
      params.type = type;
    }

    const apiResponse = await apiService({
      endpoint: `${endpoints.cat_life_banner}/get`,
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
      return {
        success: false,
        data: null,
        message: apiResponse?.response?.message || "Failed to fetch Cat Life Banner",
      };
    }
  } catch (error) {
    console.error("Error fetching Cat Life Banner:", error);
    return {
      success: false,
      data: null,
      message: "Failed to fetch Cat Life Banner",
      error: error,
    };
  }
}; 