import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateCategory = async ({ id, payload }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.category}/${id}`,
      method: "PATCH",
      data: payload,
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
