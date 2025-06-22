import NavbarItem from "@/components/navbar/navbar_items";
import BannerForm from "./components/BannerForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { fetchBanners } from "../../helpers/fetchBanners";

const BannerEditor = () => {
  const { selectedType } = useParams();
  console.log(selectedType);

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["banner", selectedType],
    queryFn: () => fetchBanners(selectedType),
    enabled: !!selectedType,
  });
  const initialData = initialDataRes?.data?.data[0];

  const breadcrumbs = [
    {
      title: "Banners",
      isNavigation: true,
      path: "/dashboard/banners",
    },
    { title: selectedType ? "Edit Banner" : "Add Banner", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Banner" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center">
            <CustomSpinner />
          </div>
        ) : (
          <BannerForm initialData={initialData} isEdit={!!selectedType} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default BannerEditor; 