import NavbarItem from "@/components/navbar/navbar_items";
import ProductForm from "./components/ProductForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getProductById } from "./helper/getProductById";

const ProductEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById({ id }),
    enabled: !!id,
  });
  const initialData = initialDataRes?.response?.data;

  const breadcrumbs = [
    {
      title: "Products",
      isNavigation: true,
      path: "/dashboard/product",
    },
    { title: id ? "Edit Product" : "Add Product", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Product" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center ">
            <CustomSpinner />
          </div>
        ) : (
          <ProductForm initialData={initialData} isEdit={!!id} />
        )}
      </div>
    </div>
  );
};

export default ProductEditor;
