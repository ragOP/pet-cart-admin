import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const getBreedById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.sub_category}/${id}`,
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
