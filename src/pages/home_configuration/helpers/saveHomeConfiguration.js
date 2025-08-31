import { apiService } from "@/api/api_services";

export const saveHomeConfiguration = async (configData) => {
  try {
    const apiResponse = await apiService({
      endpoint: "api/home-configuration",
      method: "POST",
      data: configData,
    });

    // Return the entire API response for frontend handling
    return apiResponse?.response || { success: false, error: 'No response from API' };
  } catch (error) {
    console.error("Error saving home configuration:", error);
    return { success: false, error: error.message || "Network error occurred" };
  }
};

export const updateHomeConfiguration = async (configId, configData) => {
  try {
    const apiResponse = await apiService({
      endpoint: `api/home-configuration/${configId}`,
      method: "PUT",
      data: configData,
    });

    if (apiResponse?.response?.success) {
      return { success: true, data: apiResponse?.response?.data };
    }

    return { success: false, error: apiResponse?.response?.message || "Failed to update configuration" };
  } catch (error) {
    console.error("Error updating home configuration:", error);
    return { success: false, error: "Network error occurred" };
  }
};

export const getHomeConfiguration = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: "api/home-configuration",
      method: "GET",
    });

    if (apiResponse?.response?.success) {
      return { success: true, data: apiResponse?.response?.data };
    }

    return { success: false, error: apiResponse?.response?.message || "Failed to fetch configuration" };
  } catch (error) {
    console.error("Error fetching home configuration:", error);
    return { success: false, error: "Network error occurred" };
  }
}; 