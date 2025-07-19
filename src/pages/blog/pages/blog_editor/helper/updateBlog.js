import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateBlog = async ({ id, payload }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.blog}/edit/blog/${id}`,
      method: "PUT",
      data: payload,
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}; 