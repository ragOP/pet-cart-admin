import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchAllPageConfigs = async () => {
    try {
        const response = await apiService({
            endpoint: endpoints.pageConfigGetAll,
            method: "GET"
        });

        return response;
    } catch (error) {
        console.error("Error fetching page configs:", error);
        return { success: false, error: error.message || "Failed to fetch page configs" };
    }
};

export const fetchPageConfigByKey = async (pageKey) => {
    try {
        const response = await apiService({
            endpoint: `${endpoints.pageConfigGetByKey}/${pageKey}`,
            method: "GET"
        });

        return response;
    } catch (error) {
        console.error("Error fetching page config:", error);
        return { success: false, error: error.message || "Failed to fetch page config" };
    }
};

export const updatePageConfig = async (configId, pageKey, sections) => {
    try {
        const response = await apiService({
            endpoint: `${endpoints.pageConfigUpdate}/${configId}`,
            method: "PUT",
            data: {
                pageKey,
                sections
            }
        });

        return response;
    } catch (error) {
        console.error("Error updating page config:", error);
        return { success: false, error: error.message || "Failed to update page config" };
    }
}; 