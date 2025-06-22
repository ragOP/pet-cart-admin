import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createBanner = async ({ formData }) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.banner,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
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
        message: apiResponse?.response?.message || "Failed to create banner",
      };
    }
  } catch (error) {
    console.error("Error creating banner:", error);
    return {
      success: false,
      data: null,
      message: "Failed to create banner",
      error: error,
    };
  }
}; 