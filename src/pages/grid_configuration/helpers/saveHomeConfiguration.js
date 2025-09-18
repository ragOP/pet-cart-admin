import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const saveHomeConfiguration = async (configData) => {
  try {
    // Determine if this is create or update based on presence of _id
    const isUpdate = configData._id;
    const endpoint = isUpdate
      ? `${endpoints.homeConfigUpdate}/${configData._id}`
      : endpoints.homeConfigCreate;
    const method = isUpdate ? "PUT" : "POST";

    // Prepare data according to API format
    const apiData = {
      title: configData.title,
      contentType: configData.contentType,
    isTitleShow: configData.isTitleShow,
      contentItems: configData.contentItems.map((item) => ({
        itemId: item.itemId,
        link: item.link,
        imageUrl: item.image,
      })),
      keyword: configData.keyword || "home",
      grid: configData.grid,
      isActive: configData.isActive,
      position: configData.position,
      backgroundImage: configData.backgroundImage,
      bannerImage: configData.bannerImage,
    };

    const apiResponse = await apiService({
      endpoint,
      method,
      data: apiData,
    });

    // Return the entire API response for frontend handling
    return (
      apiResponse?.response || { success: false, error: "No response from API" }
    );
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

    return {
      success: false,
      error: apiResponse?.response?.message || "Failed to update configuration",
    };
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

    return {
      success: false,
      error: apiResponse?.response?.message || "Failed to fetch configuration",
    };
  } catch (error) {
    console.error("Error fetching home configuration:", error);
    return { success: false, error: "Network error occurred" };
  }
};
