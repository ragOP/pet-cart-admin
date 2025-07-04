import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateOrderStatus = async ({ id, payload }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.orders}/${id}/update-status`,
      method: "PUT",
      data: payload,
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
