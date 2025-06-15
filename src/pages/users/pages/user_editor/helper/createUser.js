import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createUser = async (payload) => {
  try {
    const response = await apiService({
      endpoint: endpoints.users,
      method: "POST",
      data: payload,
     
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
