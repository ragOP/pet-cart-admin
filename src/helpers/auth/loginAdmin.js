import { apiService } from "@/api/api_services/index";
import { endpoints } from "@/api/endpoint/index";

export const loginAdmin = async (payload) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.login,
      method: "POST",
      data: payload,
    });
    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
