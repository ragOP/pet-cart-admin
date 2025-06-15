import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const getProductById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.product}/${id}`,
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
