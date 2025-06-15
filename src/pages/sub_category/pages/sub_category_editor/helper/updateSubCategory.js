import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateSubCategory = async ({ id, payload }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.sub_category}/${id}`,
      method: "PATCH",
      data: payload,
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
