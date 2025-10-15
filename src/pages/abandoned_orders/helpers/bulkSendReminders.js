import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const bulkSendReminders = async ({ cartIds }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.abandoned_carts}/send-reminders`,
      method: "POST",
      data: { cartIds },
    });

    if (apiResponse?.response?.success) {
      return apiResponse.response;
    }

    throw new Error("Failed to send reminders");
  } catch (error) {
    console.error("Bulk send reminders error:", error);
    throw error;
  }
};

