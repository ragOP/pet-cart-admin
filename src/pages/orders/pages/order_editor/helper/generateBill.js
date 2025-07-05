import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const generateAndSendBill = async ({ orderId, customerEmail }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.orders}/generate-bill`,
      method: "POST",
      data: {
        orderId,
        customerEmail,
        sendEmail: true
      }
    });

    if (apiResponse?.response?.success) {
      return {
        success: true,
        message: apiResponse.response.message,
        data: apiResponse.response.data
      };
    }

    return {
      success: false,
      message: apiResponse?.response?.message || "Failed to generate bill"
    };
  } catch (error) {
    console.error("Error generating bill:", error);
    return {
      success: false,
      message: "Failed to generate and send bill"
    };
  }
}; 