import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const exportCategories = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.user}/export`,
      params,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};