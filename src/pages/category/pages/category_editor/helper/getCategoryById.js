import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const getCategoryById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.category}/${id}`,
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
