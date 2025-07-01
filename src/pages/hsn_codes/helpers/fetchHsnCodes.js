import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchHsnCodes = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.hsn_codes,
      method: "GET",
      params,
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
