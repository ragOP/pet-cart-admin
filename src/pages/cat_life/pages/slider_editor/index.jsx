import NavbarItem from "@/components/navbar/navbar_items";
import CatLifeBannerForm from "./components/CatLifeBannerForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getCatLifeBannerById } from "../../helpers/getCatLifeBannerById";

const CatLifeBannerEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["catLifeBanner", id],
    queryFn: () => getCatLifeBannerById({ id }),
    enabled: !!id,
  });
  const initialData = initialDataRes?.data;

  const breadcrumbs = [
    {
      title: "CatLifeBanners",
      isNavigation: true,
      path: "/dashboard/catLifeBanners",
    },
    { title: id ? "Edit CatLifeBanner" : "Add CatLifeBanner", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="CatLifeBanner" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center">
            <CustomSpinner />
          </div>
        ) : (
          <CatLifeBannerForm initialData={initialData} isEdit={!!id} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default CatLifeBannerEditor; 

