import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const deleteSlider = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.sliders}/${id}`,
      method: "DELETE",
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
        message: apiResponse?.response?.message || "Failed to delete slider",
      };
    }
  } catch (error) {
    console.error("Error deleting slider:", error);
    return {
      success: false,
      data: null,
      message: "Failed to delete slider",
      error: error,
    };
  }
}; 