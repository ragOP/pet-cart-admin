import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateBreed = async ({ id, payload }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.breed}/${id}`,
      method: "PUT",
      data: payload,
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
