import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createOrder = async ({ payload }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.orders}`,
      method: "POST",
      data: payload,
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
