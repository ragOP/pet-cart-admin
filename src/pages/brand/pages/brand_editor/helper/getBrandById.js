import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const getBrandById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.brand}/${id}`,
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
