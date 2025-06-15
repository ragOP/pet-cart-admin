import NavbarItem from "@/components/navbar/navbar_items";
import SubCategoryForm from "./components/SubCategoryForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getSubCategoryById } from "./helper/getSubCategoryById";

const SubCategoryEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getSubCategoryById({ id }),
    enabled: !!id,
  });
  const initialData = initialDataRes?.response?.data;

  const breadcrumbs = [
    {
      title: "Sub Categories",
      isNavigation: true,
      path: "/dashboard/sub_category",
    },
    { title: id ? "Edit Sub Category" : "Add Sub Category", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Sub Category" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center ">
            <CustomSpinner />
          </div>
        ) : (
          <SubCategoryForm initialData={initialData} isEdit={!!id} />
        )}
      </div>
    </div>
  );
};

export default SubCategoryEditor;
