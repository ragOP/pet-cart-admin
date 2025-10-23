import { apiService } from "./index";
import { endpoints } from "../endpoint";

export const getMonthlyStats = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.monthlyStats,
      method: "GET",
    });

    if (response.error) {
      throw new Error("Failed to fetch monthly stats");
    }

    return response.response;
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    throw error;
  }
};

export const getCustomerStats = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.customerStats,
      method: "GET",
    });

    if (response.error) {
      throw new Error("Failed to fetch customer stats");
    }

    return response.response;
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    throw error;
  }
};

export const getTopCategories = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.topCategories,
      method: "GET",
    });

    if (response.error) {
      throw new Error("Failed to fetch top categories");
    }

    return response.response;
  } catch (error) {
    console.error("Error fetching top categories:", error);
    throw error;
  }
};

export const getTopSubcategories = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.topSubcategories,
      method: "GET",
    });

    if (response.error) {
      throw new Error("Failed to fetch top subcategories");
    }

    return response.response;
  } catch (error) {
    console.error("Error fetching top subcategories:", error);
    throw error;
  }
};

export const getTopProducts = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.topProducts,
      method: "GET",
    });

    if (response.error) {
      throw new Error("Failed to fetch top products");
    }

    return response.response;
  } catch (error) {
    console.error("Error fetching top products:", error);
    throw error;
  }
};

export const getTotalSales = async () => {
  try {
    const response = await apiService({
      endpoint: endpoints.totalSales,
      method: "GET",
    });

    if (response.error) {
      throw new Error("Failed to fetch total sales");
    }

    return response.response;
  } catch (error) {
    console.error("Error fetching total sales:", error);
    throw error;
  }
};
