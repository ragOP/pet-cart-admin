import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";
import { IS_TESTING, getMockHistoryList } from "./mockData";

export const fetchReminderHistory = async ({ params }) => {
  // Return mock data if testing
  if (IS_TESTING) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return getMockHistoryList({ params });
  }

  // Real API call
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.reminder_history,
      method: "GET",
      params,
    });

    if (apiResponse?.response?.data) {
      return {
        history: apiResponse.response.data,
        total: apiResponse.response.total || apiResponse.response.data.length,
      };
    }

    return { history: [], total: 0 };
  } catch (error) {
    console.error("Error fetching reminder history:", error);
    return { history: [], total: 0 };
  }
};

