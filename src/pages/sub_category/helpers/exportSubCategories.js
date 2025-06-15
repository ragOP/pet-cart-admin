import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const exportSubCategories = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.sub_category}/export`,
      params,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};