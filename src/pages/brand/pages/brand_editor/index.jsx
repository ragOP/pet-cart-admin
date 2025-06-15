import NavbarItem from "@/components/navbar/navbar_items";
import BrandForm from "./components/BrandForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getBrandById } from "./helper/getBrandById";

const BrandEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["brand", id],
    queryFn: () => getBrandById({ id }),
    enabled: !!id,
  });
  const initialData = initialDataRes?.response?.data;

  const breadcrumbs = [
    {
      title: "Brands",
      isNavigation: true,
      path: "/dashboard/brand",
    },
    { title: id ? "Edit Brand" : "Add Brand", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Brand" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center ">
            <CustomSpinner />
          </div>
        ) : (
          <BrandForm initialData={initialData} isEdit={!!id} />
        )}
      </div>
    </div>
  );
};

export default BrandEditor;
