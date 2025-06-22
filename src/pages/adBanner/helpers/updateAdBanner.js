import { apiService } from "@/api/api_services";

export const updateAdBanner = async (payload) => {
  try {
    const apiResponse = await apiService({
      endpoint: "api/configuration/ad-banner",
      method: "POST",
      data: payload,
    });

    console.log('Update API response:', apiResponse);

    if (apiResponse?.response?.success) {
      return apiResponse.response;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}; 