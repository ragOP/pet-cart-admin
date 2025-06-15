import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchCategoryById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.category}/${id}`,
      method: "GET",
    });

    if (apiResponse?.response?.success) {
      return apiResponse?.response?.data?.category;
    }

    return [];
  } catch (error) {
    console.error(error);
  }
};
