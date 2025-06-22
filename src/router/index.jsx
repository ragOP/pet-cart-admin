import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SubCategory from "@/pages/sub_category";
import SubCategoryEditor from "@/pages/sub_category/pages/sub_category_editor";
import Brand from "@/pages/brand";
import BrandEditor from "@/pages/brand/pages/brand_editor";
import Breed from "@/pages/breed";
import BreedEditor from "@/pages/breed/pages/breed_editor";
import Collection from "@/pages/collection";
import CollectionEditor from "@/pages/collection/pages/collection_editor";
import Product from "@/pages/product";
import ProductEditor from "@/pages/product/pages/product_editor";

// import Users from "@/pages/users";
// import Layout from "@/layout";
// import Login from "../pages/login";
// import Dashboard from "../pages/dashboard";
// import ErrorPage from "../components/errors/404";
// import UserEditor from "@/pages/users/pages/user_editor";
// import Category from "@/pages/category";
// import CategoryEditor from "@/pages/category/pages/category_editor";

const Layout = lazy(() => import("@/layout"));
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Users = lazy(() => import("@/pages/users"));
const UserEditor = lazy(() => import("@/pages/users/pages/user_editor"));
const Category = lazy(() => import("@/pages/category"));
const CategoryEditor = lazy(() => import("@/pages/category/pages/category_editor"));
const ErrorPage = lazy(() => import("@/components/errors/404"));
const HeaderFooter = lazy(() => import("@/pages/headerFooter"));
const Sliders = lazy(() => import("@/pages/sliders"));
const SliderEditor = lazy(() => import("@/pages/sliders/pages/slider_editor"));
const AdBanner = lazy(() => import("@/pages/adBanner"));

const Router = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center text-lg">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Layout />}>
          {/* <Route index element={<Dashboard />} /> */}
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
          <Route path="collection/edit/:id" element={<CollectionEditor/>} />

          <Route path="product" element={<Product />} />
          <Route path="product/add" element={<ProductEditor />} />
          <Route path="product/edit/:id" element={<ProductEditor/>} />

          <Route path="header-footer" element={<HeaderFooter />} />

          <Route path="sliders" element={<Sliders />} />
          <Route path="sliders/add" element={<SliderEditor />} />
          <Route path="sliders/edit/:id" element={<SliderEditor />} />

          <Route path="ad_banner" element={<AdBanner />} />

        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
};

export default Router;
