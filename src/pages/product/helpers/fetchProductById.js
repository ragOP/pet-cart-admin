import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchProductById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.product}/${id}`,
      method: "GET",
    });

    if (apiResponse?.response?.success) {
      return apiResponse?.response?.data;
    }

    return [];
  } catch (error) {
    console.error(error);
  }
};
