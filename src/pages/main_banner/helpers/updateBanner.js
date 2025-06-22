import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateBanner = async ({ id, formData }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.banner}/${id}`,
      method: "PUT",
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
        message: apiResponse?.response?.message || "Failed to update banner",
      };
    }
  } catch (error) {
    console.error("Error updating banner:", error);
    return {
      success: false,
      data: null,
      message: "Failed to update banner",
      error: error,
    };
  }
}; 