import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";
import { IS_TESTING, getMockHistoryDetail } from "./mockData";

export const fetchReminderHistoryById = async ({ id }) => {
  // Return mock data if testing
  if (IS_TESTING) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockData = getMockHistoryDetail(id);
    if (!mockData) {
      throw new Error("Campaign not found");
    }
    return mockData;
  }

  // Real API call
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.campaign_get_single}/${id}`,
      method: "GET",
    });

    if (apiResponse?.response?.data) {
      return apiResponse.response.data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching reminder history detail:", error);
    throw error;
  }
};

