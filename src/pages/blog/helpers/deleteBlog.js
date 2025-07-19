import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const deleteBlog = async (id) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.blog}/delete/${id}`,
      method: "DELETE",
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}; 