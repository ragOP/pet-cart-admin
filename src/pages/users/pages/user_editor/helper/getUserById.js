import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const getUserById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.users}/${id}`,
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
