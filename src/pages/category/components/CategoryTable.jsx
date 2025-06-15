import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Eye, Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { use, useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { fetchCategories } from "../helpers/fetchCategories";
import { deleteCategory } from "../helpers/deleteCategory";
import { useNavigate } from "react-router";

const CategoriesTable = ({ setCategoryLength, params, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: categoriesRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories", params],
    queryFn: () => fetchCategories({ params }),
  });

  const total = categoriesRes?.categories?.length || 0;
  const categories = categoriesRes?.categories || [];

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
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully.");
      queryClient.invalidateQueries(["categories"]);
      handleCloseDialog();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete category.");
    },
  });

  const handleDeleteAdmin = (id) => {
    deleteAdminMutation(id);
  };

  const onEditCategory = (row) => {
    navigate(`/dashboard/categories/edit/${row._id}`);
  };

  useEffect(() => {
    setCategoryLength(total);
  }, [categories]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="p" className="font-medium">
            {value || "No Name Provided"}
          </Typography>
          <Typography variant="small" className="text-gray-500">
            {row?.slug || "No Slug"}
          </Typography>
        </div>
      ),
    },
    {
      key: "image",
      label: "Image",
      render: (value, row) => (
        <div className="w-14 h-14 overflow-hidden rounded-md bg-gray-100">
          <img
            src={value || "/placeholder.png"}
            alt={row?.name || "Category Image"}
            className="object-cover w-full h-full"
          />
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <Typography className="text-sm text-gray-700">
          {value || "No Description"}
        </Typography>
      ),
    },
    {
      key: "isVisible",
      label: "Visibility",
      render: (value) => (
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {value ? "Visible" : "Hidden"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created On",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography>
            {row?.createdAt
              ? format(new Date(row.createdAt), "dd/MM/yyyy")
              : "N/A"}
          </Typography>
          {row?.updatedAt && row.createdAt !== row.updatedAt && (
            <Typography className="text-gray-500 text-sm">
              Updated{" "}
              {formatDistanceToNow(new Date(row.updatedAt), {
                addSuffix: true,
              })}
            </Typography>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <ActionMenu
          options={[
            {
              label: "Edit Category",
              icon: Pencil,
              action: () => onEditCategory(row),
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


  console.log(categories);
  return (
    <>
      <CustomTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No categories found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <CustomDialog
        isOpen={openDelete}
        onClose={handleCloseDialog}
        title={`Delete ${selectedAdmin?.name}?`}
        description="This action will permanently remove the category account."
        modalType="confirmation"
        onConfirm={() => handleDeleteAdmin(selectedAdmin?._id)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default CategoriesTable;
