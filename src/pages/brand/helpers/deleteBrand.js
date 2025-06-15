import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const deleteBrand = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.brand}/${id}`,
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