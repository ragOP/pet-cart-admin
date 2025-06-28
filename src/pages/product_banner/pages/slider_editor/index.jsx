import NavbarItem from "@/components/navbar/navbar_items";
import SliderForm from "./components/ProductBannerForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getSliderById } from "../../helpers/getSliderById";

const SliderEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["slider", id],
    queryFn: () => getSliderById({ id }),
    enabled: !!id,
  });
  const initialData = initialDataRes?.data;

  const breadcrumbs = [
    {
      title: "Sliders",
      isNavigation: true,
      path: "/dashboard/sliders",
    },
    { title: id ? "Edit Slider" : "Add Slider", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Slider" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center">
            <CustomSpinner />
          </div>
        ) : (
          <SliderForm initialData={initialData} isEdit={!!id} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default SliderEditor; 