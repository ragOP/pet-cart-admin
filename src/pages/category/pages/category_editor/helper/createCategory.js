import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createCategory = async (payload) => {
  try {
    const response = await apiService({
      endpoint: endpoints.category,
      method: "POST",
      data: payload,
     
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
