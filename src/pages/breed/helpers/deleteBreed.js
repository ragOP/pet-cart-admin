import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const deleteBreed = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.breed}/${id}`,
      method: "DELETE",
    });

    if (apiResponse?.response?.success) {
      return apiResponse?.response?.data;
    }

    return [];
  } catch (error) {
    console.error(error);
  }
};