import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchHeaderFooter = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.headerFooter,
      method: "GET",
    });

    console.log('Full API response:', apiResponse); // Debug the full response

    if (apiResponse?.response?.success) {
      // The data is nested under response.data.data based on the API structure
      const data = apiResponse?.response?.data?.data || apiResponse?.response?.data;
      console.log('Extracted data:', data); // Debug the extracted data
      return data;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}; 