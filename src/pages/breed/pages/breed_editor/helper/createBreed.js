import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createBreed = async (payload) => {
  try {
    const response = await apiService({
      endpoint: endpoints.breed,
      method: "POST",
      data: payload,
     
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
