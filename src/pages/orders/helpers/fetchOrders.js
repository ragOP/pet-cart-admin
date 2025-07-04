import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchOrders = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.orders}/get-all-orders`,
      method: "GET",
      params,
    });

    if (apiResponse?.response?.success) {
      return apiResponse?.response?.data;
    }

    return [];
  } catch (error) {
    console.error(error);
  }
};
