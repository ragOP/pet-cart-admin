export const isDev = () => {
  return import.meta.env.MODE === "development";
};

export const BACKEND_URL = isDev()
  // ? "http://localhost:4000"
  ? "https://pet-caart-be.onrender.com"
  : "https://pet-caart-be.onrender.com";

export const endpoints = {
  login: "api/auth/admin/login",
  users: "api/users",
  category: "api/category",
  sub_category: "api/subcategory",
  collection: "api/collection",
  brand: "api/brand",
  breed: "api/breed",
  product: "api/product",
  headerFooter: "api/settings/header-footer/get",
  sliders: "api/sliders/slider",
  banner: "api/configuration/banner",
  cat_life_banner: "api/cat-life-banner",
  productBanner: "api/product-banner",
  hsn_codes: "api/hsn-code",
  coupons: "api/coupon",
  orders: "api/orders",
  abandoned_carts: "api/cart/abandoned",
  reminder_history: "api/reminder-history",
  campaign_start: "api/campaign/start-campaign",
  campaign_get_all: "api/campaign/get-all-campaigns",
  campaign_get_single: "api/campaign/get-single-campaign",
  blog: "api/blog",
  shiprocket: "api/shiprocket",
  homeConfigGetAll: "api/home-config/get-all-grid",
  homeConfigGetById: "api/home-config/get-grid",
  homeConfigCreate: "api/home-config/create",
  homeConfigUpdate: "api/home-config/update-grid",
  homeConfigDelete: "api/home-config/delete-grid",
  imageUpload: "api/image/upload-image",
  // Page Configuration endpoints
  pageConfigGetAll: "api/page-config/get-all-page-configs",
  pageConfigGetByKey: "api/page-config/get-page-config-by-key",
  pageConfigUpdate: "api/page-config/update-page-config",
  // Stats endpoints
  monthlyStats: "api/stats/get-monthly-stats",
  customerStats: "api/stats/get-customer-stats",
  topCategories: "api/stats/get-top-categories",
  topSubcategories: "api/stats/get-top-subcategories",
  topProducts: "api/stats/get-top-products",
  totalSales: "api/stats/get-total-sales",
};