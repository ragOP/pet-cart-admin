import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateCollection = async ({ id, payload }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.collection}/${id}`,
      method: "PUT",
      data: payload,
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
