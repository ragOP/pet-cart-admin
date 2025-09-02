import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

// Get all grid configurations
export const fetchAllGridConfigs = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.homeConfigGetAll,
      method: "GET",
    });
    return response?.response;
  } catch (error) {
    console.error("Error fetching grid configurations:", error);
    throw error;
  }
};

// Get grid configuration by ID
export const fetchGridConfigById = async (id) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.homeConfigGetById}/${id}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Error fetching grid configuration:", error);
    throw error;
  }
};

// Create new grid configuration
export const createGridConfig = async (configData) => {
  try {
    const response = await apiService({
      endpoint: endpoints.homeConfigCreate,
      method: "POST",
      data: configData,
    });
    return response;
  } catch (error) {
    console.error("Error creating grid configuration:", error);
    throw error;
  }
};

// Update grid configuration
export const updateGridConfig = async (id, configData) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.homeConfigUpdate}/${id}`,
      method: "PUT",
      data: configData,
    });
    return response;
  } catch (error) {
    console.error("Error updating grid configuration:", error);
    throw error;
  }
};

// Delete grid configuration
export const deleteGridConfig = async (id) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.homeConfigDelete}/${id}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Error deleting grid configuration:", error);
    throw error;
  }
};

// Update positions after drag and drop
export const updateGridPositions = async (configs) => {
  try {
    // Update each configuration's position
    const updatePromises = configs.map((config, index) =>
      updateGridConfig(config._id, { ...config, position: index })
    );
    
    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error("Error updating grid positions:", error);
    throw error;
  }
}; 