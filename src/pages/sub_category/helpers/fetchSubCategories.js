import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchSubCategories = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.sub_category,
      method: "GET",
      params,
    });

    if (apiResponse?.response?.success) {
      return apiResponse?.response?.data;
    }

    return [];
  } catch (error) {
    console.error(error);
  }
};

export const fetchSubCategoriesByCategoryId = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.sub_category,
      method: "GET",
      params,
    });

    if (apiResponse?.response?.success) {
      return apiResponse?.response?.data;
    }

    return [];
  } catch (error) {
    console.error(error);
  }
}
