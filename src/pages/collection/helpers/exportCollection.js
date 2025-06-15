import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const exportCollections = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.collection}/export`,
      params,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};