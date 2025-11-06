import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2 } from "lucide-react";
import CustomDataGrid from "@/components/custom_data_grid";
import Typography from "@/components/typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { fetchUsers } from "../helpers/fetchUsers";
import { deleteUser } from "../helpers/deleteUser";
import { useNavigate } from "react-router";
const UsersTable = ({
  setUsersLength,
  params,
  setParams,
  onSelectedUsersChange,
}) => {
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

  const total = useMemo(() => usersRes?.total ?? 0, [usersRes]);
  const users = useMemo(() => usersRes?.data ?? [], [usersRes]);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedUsersMap, setSelectedUsersMap] = useState({});

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
    onSuccess: (_, userId) => {
      toast.success("User deleted successfully.");
      setSelectedUsersMap((prev) => {
        if (!prev[userId]) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      });
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
    setUsersLength(users?.length ?? 0);
  }, [users, setUsersLength]);

  useEffect(() => {
    if (!users || users.length === 0) {
      return;
    }

    setSelectedUsersMap((prev) => {
      let hasChanges = false;
      let next = prev;

      users.forEach((user) => {
        const id = user?._id;
        if (!id || !prev[id] || prev[id] === user) {
          return;
        }

        if (!hasChanges) {
          next = { ...prev };
          hasChanges = true;
        }

        next[id] = user;
      });

      return hasChanges ? next : prev;
    });
  }, [users]);

  const selectedRowIds = useMemo(() => {
    return Object.keys(selectedUsersMap).reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});
  }, [selectedUsersMap]);

  const selectedUsers = useMemo(
    () => Object.values(selectedUsersMap),
    [selectedUsersMap]
  );

  useEffect(() => {
    onSelectedUsersChange?.(selectedUsers);
  }, [selectedUsers, onSelectedUsersChange]);

  const handleSelectedRowIdsChange = useCallback(
    (nextSelection = {}) => {
      setSelectedUsersMap((prev) => {
        const next = { ...prev };

        Object.keys(next).forEach((id) => {
          if (!nextSelection[id]) {
            delete next[id];
          }
        });

        users.forEach((user) => {
          const id = user?._id;
          if (!id) return;
          if (nextSelection[id]) {
            next[id] = user;
          }
        });

        return next;
      });
    },
    [users]
  );

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value) => (
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
            {
              label: "Delete User",
              icon: Trash2,
              action: () => handleOpenDialog(row),
              className: "text-red-500",
            },
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
      <CustomDataGrid
        columns={columns}
        data={users}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No users found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        enableRowSelection
        selectedRowIds={selectedRowIds}
        onSelectedRowIdsChange={handleSelectedRowIdsChange}
        showPageSizeSelector={false}
        // className="py-0 gap-0"
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
