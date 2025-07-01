import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const getCouponById = async ({ id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.coupons}/${id}`,
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
