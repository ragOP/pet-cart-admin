import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const updateHeaderFooter = async (formData) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.headerFooter.replace('/get', '/create'),
      method: "POST",
      data: formData,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it with boundary
        'Content-Type': undefined,
      },
    });

    if (apiResponse?.response?.success) {
      return apiResponse?.response?.data;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}; 