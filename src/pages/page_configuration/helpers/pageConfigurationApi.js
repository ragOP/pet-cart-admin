import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchHomeSections = async () => {
    try {
        const response = await apiService({
            endpoint: endpoints.homeSections,
            method: "GET"
        });

        // Return response as-is without formatting
        return response;
    } catch (error) {
        console.error("Error fetching home sections:", error);
        return { success: false, error: error.message || "Failed to fetch home sections" };
    }
};

export const saveHomeSections = async (sections) => {
    try {
        const response = await apiService({
            endpoint: endpoints.homeSections,
            method: "POST",
            data: sections
        });

        // Return response as-is without formatting
        return response;
    } catch (error) {
        console.error("Error saving home sections:", error);
        return { success: false, error: error.message || "Failed to save home sections" };
    }
};
