import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { fetchSubCategories } from "../helpers/fetchSubCategories";
import { fetchCategoryById } from "@/pages/category/helpers/fetchCategoryById";
import { deleteSubCategory } from "../helpers/deleteSubCategory";
import { useNavigate } from "react-router";

const SubCategoriesTable = ({ setSubCategoryLength, params, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: subCategoriesRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sub_categories", params],
    queryFn: () => fetchSubCategories({ params }),
  });

  const total = subCategoriesRes?.data?.length || 0;
  const subCategories = subCategoriesRes?.data || [];

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [subCategoriesWithCategory, setSubCategoriesWithCategory] = useState([]);

  const handleOpenDialog = (admin) => {
    setOpenDelete(true);
    setSelectedAdmin(admin);
  };

  const handleCloseDialog = () => {
    setOpenDelete(false);
    setSelectedAdmin(null);
  };

  const { mutate: deleteAdminMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteSubCategory,
    onSuccess: () => {
      toast.success("SubCategory deleted successfully.");
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

  const onEditSubCategory = (row) => {
    navigate(`/dashboard/sub_category/edit/${row._id}`);
  };

  useEffect(() => {
    setSubCategoryLength(total);
  }, [subCategories]);

  // 🔄 Fetch category names by ID after subCategories change
  useEffect(() => {
    const fetchCategories = async () => {
      const enriched = await Promise.all(
        subCategories.map(async (sub) => {
          try {
            const res = await fetchCategoryById({ id: sub.categoryId });
            console.log(res);
            return {
              ...sub,
              categoryName: res?.name || "Unknown",
            };
          } catch (e) {
            return {
              ...sub,
              categoryName: "Unknown",
            };
          }
        })
      );
      setSubCategoriesWithCategory(enriched);
    };

    if (subCategories.length > 0) fetchCategories();
  }, [subCategories]);

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
            alt={row?.name || "SubCategory Image"}
            className="object-cover w-full h-full"
          />
        </div>
      ),
    },
    {
      key: "categoryId",
      label: "Parent Category",
      render: (value, row) => (
        <Typography className="text-sm text-gray-700">
          {row?.categoryName || "Unknown"}
        </Typography>
      ),
    },
    {
      key: "dynamicFields",
      label: "Dynamic Fields",
      render: (value) =>
        value ? (
          <pre className="text-xs bg-gray-50 p-2 rounded max-w-xs overflow-x-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        ) : (
          <Typography className="text-sm text-gray-500">N/A</Typography>
        ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {value ? "Active" : "Inactive"}
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
              label: "Edit SubCategory",
              icon: Pencil,
              action: () => onEditSubCategory(row),
            },
            {
              label: "Delete SubCategory",
              icon: Trash2,
              action: () => handleOpenDialog(row),
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
      <CustomTable
        columns={columns}
        data={subCategoriesWithCategory}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No sub categories found"
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

export default SubCategoriesTable;
