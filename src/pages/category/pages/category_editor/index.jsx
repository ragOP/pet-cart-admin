import NavbarItem from "@/components/navbar/navbar_items";
import CategoryForm from "./components/CategoryForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getCategoryById } from "./helper/getCategoryById";

const CategoryEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById({ id }),
    enabled: !!id,
  });
  const initialData = initialDataRes?.response?.data?.category;

  const breadcrumbs = [
    {
      title: "Categories",
      isNavigation: true,
      path: "/dashboard/categories",
    },
    { title: id ? "Edit Category" : "Add Category", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Category" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center ">
            <CustomSpinner />
          </div>
        ) : (
          <CategoryForm initialData={initialData} isEdit={!!id} />
        )}
      </div>
    </div>
  );
};

export default CategoryEditor;
