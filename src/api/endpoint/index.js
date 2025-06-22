export const isDev = () => {
  return import.meta.env.MODE === "development";
};

export const BACKEND_URL = isDev()
  ? "https://pet-caart-be.onrender.com"
  : "https://techmi-crm-be-kirp.onrender.com";

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
};



