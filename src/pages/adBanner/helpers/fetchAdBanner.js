import { apiService } from "@/api/api_services";

export const fetchAdBanner = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: "api/configuration/ad-banner",
      method: "GET",
    });

    console.log('Full API response:', apiResponse);

    if (apiResponse?.response?.success) {
      const data = apiResponse?.response?.data?.data || apiResponse?.response?.data;
      console.log('Extracted data:', data);
      return data;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}; 