import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createSubCategory = async (payload) => {
  try {
    const response = await apiService({
      endpoint: endpoints.sub_category,
      method: "POST",
      data: payload,
     
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};
