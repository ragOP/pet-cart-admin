import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const getSliderById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.sliders}/${id}`,
      method: "GET",
    });

    if (apiResponse?.response?.success) {
      return {
        success: true,
        data: apiResponse.response.data.data,
        message: apiResponse.response.message,
      };
    } else {
      return {
        success: false,
        data: null,
        message: apiResponse?.response?.message || "Failed to fetch slider",
      };
    }
  } catch (error) {
    console.error("Error fetching slider:", error);
    return {
      success: false,
      data: null,
      message: "Failed to fetch slider",
      error: error,
    };
  }
}; 