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

// Import frequently used components directly to avoid loading delays
import Login from "@/pages/login";
import Layout from "@/layout";
import Dashboard from "@/pages/dashboard";
import ErrorPage from "@/components/errors/404";

// Lazy load less frequently used components
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
const GridConfiguration = lazy(() => import("@/pages/grid_configuration"));


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

          <Route path="users" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Users />
            </Suspense>
          } />
          <Route path="users/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <UserEditor />
            </Suspense>
          } />
          <Route path="users/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <UserEditor />
            </Suspense>
          } />

          <Route path="category" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Category />
            </Suspense>
          } />
          <Route path="category/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <CategoryEditor />
            </Suspense>
          } />
          <Route path="category/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <CategoryEditor />
            </Suspense>
          } />

          <Route path="sub_category" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <SubCategory />
            </Suspense>
          } />
          <Route path="sub_category/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <SubCategoryEditor />
            </Suspense>
          } />
          <Route path="sub_category/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <SubCategoryEditor />
            </Suspense>
          } />

          <Route path="brand" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Brand />
            </Suspense>
          } />
          <Route path="brand/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <BrandEditor />
            </Suspense>
          } />
          <Route path="brand/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <BrandEditor />
            </Suspense>
          } />

          <Route path="breed" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Breed />
            </Suspense>
          } />
          <Route path="breed/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <BreedEditor />
            </Suspense>
          } />
          <Route path="breed/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <BreedEditor />
            </Suspense>
          } />

          <Route path="collection" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Collection />
            </Suspense>
          } />
          <Route path="collection/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <CollectionEditor />
            </Suspense>
          } />
          <Route path="collection/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <CollectionEditor />
            </Suspense>
          } />

          <Route path="product" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Product />
            </Suspense>
          } />
          <Route path="product/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <ProductEditor />
            </Suspense>
          } />
          <Route path="product/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <ProductEditor />
            </Suspense>
          } />

          <Route path="header-footer" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <HeaderFooter />
            </Suspense>
          } />

          {/* <Route path="home-configuration" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <HomeConfiguration />
            </Suspense>
          } /> */}

          <Route path="grid-configuration" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <GridConfiguration />
            </Suspense>
          } />

          <Route path="sliders" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Sliders />
            </Suspense>
          } />
          <Route path="sliders/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <SliderEditor />
            </Suspense>
          } />
          <Route path="sliders/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <SliderEditor />
            </Suspense>
          } />

          <Route path="ad_banner" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <AdBanner />
            </Suspense>
          } />

          <Route path="banners" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Banners />
            </Suspense>
          } />
          <Route path="banners/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <BannerEditor />
            </Suspense>
          } />
          <Route path="banners/edit/:selectedType" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <BannerEditor />
            </Suspense>
          } />

          <Route path="cat-life-banner" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <CatLifeBanners />
            </Suspense>
          } />
          <Route path="cat-life-banner/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <CatLifeBannerEditor />
            </Suspense>
          } />
          <Route path="cat-life-banner/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <CatLifeBannerEditor />
            </Suspense>
          } />

          <Route path="product-banner" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <ProductBanner />
            </Suspense>
          } />
          <Route path="product-banner/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <ProductBannerEditor />
            </Suspense>
          } />
          <Route path="product-banner/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <ProductBannerEditor />
            </Suspense>
          } />

          <Route path="hsn_codes" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <HSNCode />
            </Suspense>
          } />
          <Route path="hsn_codes/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <HSNCodeEditor />
            </Suspense>
          } />
          <Route path="hsn_codes/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <HSNCodeEditor />
            </Suspense>
          } />

          <Route path="coupons" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Coupons />
            </Suspense>
          } />
          <Route path="coupons/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <CouponEditor />
            </Suspense>
          } />
          <Route path="coupons/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <CouponEditor />
            </Suspense>
          } />

          <Route path="orders" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Orders />
            </Suspense>
          } />
          <Route path="orders/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <OrderEditor />
            </Suspense>
          } />

          <Route path="blog" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <Blog />
            </Suspense>
          } />
          <Route path="blog/add" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <BlogEditor />
            </Suspense>
          } />
          <Route path="blog/edit/:id" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <BlogEditor />
            </Suspense>
          } />

          <Route path="news-letter" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <NewsLetter />
            </Suspense>
          } />
          <Route path="blog-featured-products" element={
            <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            }>
              <BlogFeaturedProducts />
            </Suspense>
          } />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default Router;
