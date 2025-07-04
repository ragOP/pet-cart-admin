import NavbarItem from "@/components/navbar/navbar_items";
import ProductBannerForm from "./components/ProductBannerForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { fetchProductBanner } from "../../helpers/fetchProductBanner";
import { useState } from "react";

const ProductBannerEditor = () => {
  const { id } = useParams();
  const [selectedType, setSelectedType] = useState("web");

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["product-banner", id],
    queryFn: () => fetchProductBanner(selectedType),
    enabled: !!id,
  });
  const initialData = initialDataRes?.data?.data;
  console.log("Initial data:", initialData);
  const breadcrumbs = [
    {
      title: "Product Banner",
      isNavigation: true,
      path: "/dashboard/product-banner",
    },
    { title: id ? "Edit Product Banner" : "Add Product Banner", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Product Banner" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center">
            <CustomSpinner />
          </div>
        ) : (
          <ProductBannerForm initialData={initialData} isEdit={!!id} isLoading={isLoading} selectedType={selectedType} />
        )}
      </div>
    </div>
  );
};

export default ProductBannerEditor; 