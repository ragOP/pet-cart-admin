import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const deleteCoupon = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.coupons}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
