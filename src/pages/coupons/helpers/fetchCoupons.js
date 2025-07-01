import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const fetchCoupons = async ({ params }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.coupons}/all/admin`,
      method: "GET",
      params,
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
