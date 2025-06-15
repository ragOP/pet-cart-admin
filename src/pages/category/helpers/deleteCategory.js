import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const deleteCategory = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.users}/${id}`,
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