import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const getOrderById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.orders}/get-order-by-id/${id}`,
      method: "GET",
    });

    if (apiResponse?.response?.success) {
      return apiResponse?.response?.data;
    }

    return null;
  } catch (error) {
    console.error(error);
  }
};
