import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateProductBanner = async ({ formData }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.productBanner}/update`,
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
        message: apiResponse?.response?.message || "Failed to update product banner",
      };
    }
  } catch (error) {
    console.error("Error updating product banner:", error);
    return {
      success: false,
      data: null,
      message: "Failed to update product banner",
      error: error,
    };
  }
}; 