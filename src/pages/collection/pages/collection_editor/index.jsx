import NavbarItem from "@/components/navbar/navbar_items";
import CollectionForm from "./components/CollectionForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getCollectionById } from "./helper/getSubCollectionById";

const CollectionEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["collection", id],
    queryFn: () => getCollectionById({ id }),
    enabled: !!id,
  });
  const initialData = initialDataRes?.response?.data;

  const breadcrumbs = [
    {
      title: "Collections",
      isNavigation: true,
      path: "/dashboard/collection",
    },
    { title: id ? "Edit Collection" : "Add Collection", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Collection" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center ">
            <CustomSpinner />
          </div>
        ) : (
          <CollectionForm initialData={initialData} isEdit={!!id} />
        )}
      </div>
    </div>
  );
};

export default CollectionEditor;
