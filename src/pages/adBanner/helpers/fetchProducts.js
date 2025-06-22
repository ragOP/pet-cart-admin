import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchProducts = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.product,
      method: "GET",
    });

    console.log('Products API response:', apiResponse);

    if (apiResponse?.response?.success) {
      const data = apiResponse?.response?.data?.data || apiResponse?.response?.data;
      console.log('Products data:', data);
      return data;
    }

    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
}; 