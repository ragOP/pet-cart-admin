import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const createShiprocketOrder = async ({ orderId, dimensions }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.orders}/${orderId}/create-shiprocket-order`,
      method: "POST",
      data: {
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
  }
}; 