import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateUser = async ({ id, payload }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.users}/user/update/${id}`,
      method: "PUT",
      data: payload,
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
