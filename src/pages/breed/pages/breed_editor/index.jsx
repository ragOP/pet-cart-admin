import NavbarItem from "@/components/navbar/navbar_items";
import BreedForm from "./components/BreedForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getBreedById } from "./helper/getBreedById";

const BreedEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["breed", id],
    queryFn: () => getBreedById({ id }),
    enabled: !!id,
  });

  const initialData = initialDataRes?.response?.data;

  const breadcrumbs = [
    {
      title: "Breeds",
      isNavigation: true,
      path: "/dashboard/breed",
    },
    { title: id ? "Edit Breed" : "Add Breed", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Breed" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center ">
            <CustomSpinner />
          </div>
        ) : (
          <BreedForm initialData={initialData} isEdit={!!id} />
        )}
      </div>
    </div>
  );
};

export default BreedEditor;
