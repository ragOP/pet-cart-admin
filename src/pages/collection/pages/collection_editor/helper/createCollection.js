import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createCollection = async (payload) => {
  try {
    const response = await apiService({
      endpoint: endpoints.collection,
      method: "POST",
      data: payload,
     
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
