import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createProduct = async (payload) => {
  try {
    const response = await apiService({
      endpoint: endpoints.product,
      method: "POST",
      data: payload,
     
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
