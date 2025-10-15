import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchAbandonedOrders = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.abandoned_carts,
      method: "GET",
      params,
    });

    if (apiResponse?.response?.data) {
      return {
        abandonedOrders: apiResponse.response.data,
        total: apiResponse.response.data.length,
      };
    }

    return { abandonedOrders: [], total: 0 };
  } catch (error) {
    console.error(error);
    return { abandonedOrders: [], total: 0 };
  }
};

