import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchAbandonedOrderById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.abandoned_carts}/${id}`,
      method: "GET",
    });

    if (apiResponse?.response?.data) {
      return apiResponse.response.data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching abandoned order:", error);
    throw error;
  }
};

