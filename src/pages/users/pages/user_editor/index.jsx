import NavbarItem from "@/components/navbar/navbar_items";
import UserForm from "./components/UserForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getUserById } from "./helper/getUserById";

const UserEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById({ id }),
    enabled: !!id,
  });

  const initialData = initialDataRes?.data;

  const breadcrumbs = [
    {
      title: "Users",
      isNavigation: true,
      path: "/dashboard/users",
    },
    { title: id ? "Edit User" : "Add User", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="User" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center ">
            <CustomSpinner />
          </div>
        ) : (
          <UserForm initialData={initialData} isEdit={!!id} />
        )}
      </div>
    </div>
  );
};

export default UserEditor;
