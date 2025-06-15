import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchBreeds = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.breed,
      method: "GET",
      params,
    });

    if (apiResponse?.response?.success) {
      return apiResponse?.response?.data;
    }

    return [];
  } catch (error) {
    console.error(error);
  }
};
