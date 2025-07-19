import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const getBlogById = async ({ id }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.blog}/get-single-blog/${id}`,
      method: "GET",
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}; 