import NavbarItem from "@/components/navbar/navbar_items";
import OrderForm from "./components/OrderForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getOrderById } from "./helper/getOrderById";

const OrderEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById({ id }),
    enabled: !!id,
  });

  const initialData = initialDataRes;

  const breadcrumbs = [
    {
      title: "Orders",
      isNavigation: true,
      path: "/dashboard/orders",
    },
    { title: id ? "Edit Order" : "Add Order", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Order" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center ">
            <CustomSpinner />
          </div>
        ) : (
          <OrderForm initialData={initialData} isEdit={!!id} />
        )}
      </div>
    </div>
  );
};

export default OrderEditor;
