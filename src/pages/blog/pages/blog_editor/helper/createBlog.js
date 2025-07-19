import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createBlog = async (payload) => {
  try {
    const response = await apiService({
      endpoint: endpoints.blog,
      method: "POST",
      data: payload,
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}; 