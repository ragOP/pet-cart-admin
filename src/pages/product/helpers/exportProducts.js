import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const exportProducts = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.product}/export`,
      params,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};