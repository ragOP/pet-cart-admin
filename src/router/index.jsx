import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCredentials } from "@/redux/admin/adminSlice";
import { getToken, removeToken } from "@/utils/auth";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

// Auth Route Wrappers
import ProtectedRoute from "@/auth/ProtectedRoute";
import PublicRoute from "@/auth/PublicRoute";

// Lazy loaded pages
const Login = lazy(() => import("@/pages/login"));
const Layout = lazy(() => import("@/layout"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const ErrorPage = lazy(() => import("@/components/errors/404"));

const Users = lazy(() => import("@/pages/users"));
const UserEditor = lazy(() => import("@/pages/users/pages/user_editor"));

const Category = lazy(() => import("@/pages/category"));
const CategoryEditor = lazy(() => import("@/pages/category/pages/category_editor"));

const SubCategory = lazy(() => import("@/pages/sub_category"));
const SubCategoryEditor = lazy(() => import("@/pages/sub_category/pages/sub_category_editor"));

const Brand = lazy(() => import("@/pages/brand"));
const BrandEditor = lazy(() => import("@/pages/brand/pages/brand_editor"));

const Breed = lazy(() => import("@/pages/breed"));
const BreedEditor = lazy(() => import("@/pages/breed/pages/breed_editor"));

const Collection = lazy(() => import("@/pages/collection"));
const CollectionEditor = lazy(() => import("@/pages/collection/pages/collection_editor"));

const Product = lazy(() => import("@/pages/product"));
const ProductEditor = lazy(() => import("@/pages/product/pages/product_editor"));

const HeaderFooter = lazy(() => import("@/pages/headerFooter"));

const Sliders = lazy(() => import("@/pages/sliders"));
const SliderEditor = lazy(() => import("@/pages/sliders/pages/slider_editor"));

const AdBanner = lazy(() => import("@/pages/adBanner"));

const Banners = lazy(() => import("@/pages/main_banner"));
const BannerEditor = lazy(() => import("@/pages/main_banner/pages/banner_editor"));

const CatLifeBanners = lazy(() => import("@/pages/cat_life"));
const CatLifeBannerEditor = lazy(() => import("@/pages/cat_life/pages/slider_editor"));

const ProductBanner = lazy(() => import("@/pages/product_banner"));
const ProductBannerEditor = lazy(() => import("@/pages/product_banner/pages/product_banner_editor"));

const HSNCode = lazy(() => import("@/pages/hsn_codes"));
const HSNCodeEditor = lazy(() => import("@/pages/hsn_codes/pages/hsn_codes_editor"));

const Coupons = lazy(() => import("@/pages/coupons"));
const CouponEditor = lazy(() => import("@/pages/coupons/pages/coupon_editor"));

const Orders = lazy(() => import("@/pages/orders"));
const OrderEditor = lazy(() => import("@/pages/orders/pages/order_editor"));

const Blog = lazy(() => import("@/pages/blog"));
const BlogEditor = lazy(() => import("@/pages/blog/pages/blog_editor"));

const NewsLetter = lazy(() => import("@/pages/newsLetter"));
const BlogFeaturedProducts = lazy(() => import("@/pages/blog_featured_products"));  

const Router = () => {
  const dispatch = useDispatch();

  // Session Expiration Check
  const checkTokenExpiration = () => {
    const token = getToken();
    if (!token) return;

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        removeToken();
        dispatch(clearCredentials());
        toast.error("Your session has expired. Please login again.");
      }
    } catch (err) {
      console.error("Token decode error", err);
      removeToken();
    }
  };

  useEffect(() => {
    checkTokenExpiration();
  }, []);

  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <Routes>
        {/* Redirect base to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Layout />}>
            {/* Index dashboard (optional) */}
            <Route index element={<Dashboard />} />

            <Route path="users" element={<Users />} />
            <Route path="users/add" element={<UserEditor />} />
            <Route path="users/edit/:id" element={<UserEditor />} />

            <Route path="category" element={<Category />} />
            <Route path="category/add" element={<CategoryEditor />} />
            <Route path="category/edit/:id" element={<CategoryEditor />} />

            <Route path="sub_category" element={<SubCategory />} />
            <Route path="sub_category/add" element={<SubCategoryEditor />} />
            <Route path="sub_category/edit/:id" element={<SubCategoryEditor />} />

            <Route path="brand" element={<Brand />} />
            <Route path="brand/add" element={<BrandEditor />} />
            <Route path="brand/edit/:id" element={<BrandEditor />} />

            <Route path="breed" element={<Breed />} />
            <Route path="breed/add" element={<BreedEditor />} />
            <Route path="breed/edit/:id" element={<BreedEditor />} />

            <Route path="collection" element={<Collection />} />
            <Route path="collection/add" element={<CollectionEditor />} />
            <Route path="collection/edit/:id" element={<CollectionEditor />} />

            <Route path="product" element={<Product />} />
            <Route path="product/add" element={<ProductEditor />} />
            <Route path="product/edit/:id" element={<ProductEditor />} />

            <Route path="header-footer" element={<HeaderFooter />} />

            <Route path="sliders" element={<Sliders />} />
            <Route path="sliders/add" element={<SliderEditor />} />
            <Route path="sliders/edit/:id" element={<SliderEditor />} />

            <Route path="ad_banner" element={<AdBanner />} />

            <Route path="banners" element={<Banners />} />
            <Route path="banners/add" element={<BannerEditor />} />
            <Route path="banners/edit/:selectedType" element={<BannerEditor />} />

            <Route path="cat-life-banner" element={<CatLifeBanners />} />
            <Route path="cat-life-banner/add" element={<CatLifeBannerEditor />} />
            <Route path="cat-life-banner/edit/:id" element={<CatLifeBannerEditor />} />

            <Route path="product-banner" element={<ProductBanner />} />
            <Route path="product-banner/add" element={<ProductBannerEditor />} />
            <Route path="product-banner/edit/:id" element={<ProductBannerEditor />} />

            <Route path="hsn_codes" element={<HSNCode />} />
            <Route path="hsn_codes/add" element={<HSNCodeEditor />} />
            <Route path="hsn_codes/edit/:id" element={<HSNCodeEditor />} />

            <Route path="coupons" element={<Coupons />} />
            <Route path="coupons/add" element={<CouponEditor />} />
            <Route path="coupons/edit/:id" element={<CouponEditor />} />

            <Route path="orders" element={<Orders />} />
            <Route path="orders/edit/:id" element={<OrderEditor />} />

            <Route path="blog" element={<Blog />} />
            <Route path="blog/add" element={<BlogEditor />} />
            <Route path="blog/edit/:id" element={<BlogEditor />} />

            <Route path="news-letter" element={<NewsLetter />} />
            <Route path="blog-featured-products" element={<BlogFeaturedProducts />} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
};

export default Router;
