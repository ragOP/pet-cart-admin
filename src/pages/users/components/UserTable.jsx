import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Eye, Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { use, useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { fetchUsers } from "../helpers/fetchUsers";
import { deleteUser } from "../helpers/deleteUser";
import { useNavigate } from "react-router";

const UsersTable = ({ setUsersLength, params, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: usersRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsers({ params }),
  });

  const total = usersRes?.total;
  const users = usersRes?.data;

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const handleOpenDialog = (admin) => {
    setOpenDelete(true);
    setSelectedAdmin(admin);
  };

  const handleCloseDialog = () => {
    setOpenDelete(false);
    setSelectedAdmin(null);
  };

  const { mutate: deleteAdminMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully.");
      queryClient.invalidateQueries(["users"]);
      handleCloseDialog();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete user.");
    },
  });

  const handleDeleteAdmin = (id) => {
    deleteAdminMutation(id);
  };

  const onEditUser = (row) => {
    navigate(`/dashboard/users/edit/${row._id}`);
  };

  useEffect(() => {
    setUsersLength(users?.length);
  }, [users]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="p" className="font-medium">
            {value || "No Name Provided"}
          </Typography>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="p" className="text-gray-600">
            {row.email || "No Email Provided"}
          </Typography>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Account Created",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography>
            {row.createdAt ? format(new Date(row.createdAt), "dd/MM/yyyy") : "N/A"}
          </Typography>
          {value !== row.updatedAt && (
            <Typography className="text-gray-500 text-sm">
              Last updated -{" "}
              {formatDistanceToNow(new Date(row.updatedAt), {
                addSuffix: true,
              })}
            </Typography>
          )}
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <span className="capitalize bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <ActionMenu
          options={[
            // {
            //   label: "View User Details",
            //   icon: Eye,
            //   action: () => console.log("View user details"),
            // },
            {
              label: "Edit User",
              icon: Pencil,
              action: () => onEditUser(row),
            },
            // {
            //   label: "Delete User",
            //   icon: Trash2,
            //   action: () => handleOpenDialog(row),
            //   className: "text-red-500",
            // },
          ]}
        />
      ),
    },
  ];

  const onPageChange = (page) => {
    setParams((prev) => ({
      ...prev,
      page: page + 1,
    }));
  };

  const perPage = params.per_page;
  const currentPage = params.page;
  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <CustomTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No users found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <CustomDialog
        isOpen={openDelete}
        onClose={handleCloseDialog}
        title={`Delete ${selectedAdmin?.name}?`}
        description="This action will permanently remove the user account."
        modalType="confirmation"
        onConfirm={() => handleDeleteAdmin(selectedAdmin?._id)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default UsersTable;
