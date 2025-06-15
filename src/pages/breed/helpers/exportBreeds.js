import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const exportBreeds = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.breed}/export`,
      params,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};