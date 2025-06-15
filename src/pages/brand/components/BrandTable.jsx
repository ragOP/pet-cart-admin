import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { fetchBrands } from "../helpers/fetchBrand";
import { deleteBrand } from "../helpers/deleteBrand";
import { useNavigate } from "react-router";

const BrandTable = ({ setBrandLength, params, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: brandRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["brands", params],
    queryFn: () => fetchBrands({ params }),
  });

  const brands = brandRes?.data || [];
  const total = brands.length;

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const handleOpenDialog = (brand) => {
    setOpenDelete(true);
    setSelectedBrand(brand);
  };

  const handleCloseDialog = () => {
    setOpenDelete(false);
    setSelectedBrand(null);
  };

  const { mutate: deleteBrandMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success("Brand deleted successfully.");
      queryClient.invalidateQueries(["brands"]);
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Failed to delete brand.");
    },
  });

  const handleDeleteBrand = (id) => {
    deleteBrandMutation(id);
  };

  const onEditBrand = (row) => {
    navigate(`/dashboard/brand/edit/${row._id}`);
  };

  useEffect(() => {
    setBrandLength(total);
  }, [brands]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="p" className="font-medium">
            {value || "No Name"}
          </Typography>
          <Typography variant="small" className="text-gray-500">
            {row?.slug || "No Slug"}
          </Typography>
        </div>
      ),
    },
    {
      key: "logo",
      label: "Logo",
      render: (value, row) => (
        <div className="w-14 h-14 overflow-hidden rounded-md bg-gray-100">
          <img
            src={value || "/placeholder.png"}
            alt={row?.name || "Brand Logo"}
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
          {value || "No description"}
        </Typography>
      ),
    },
    {
      key: "active",
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
              label: "Edit Brand",
              icon: Pencil,
              action: () => onEditBrand(row),
            },
            {
              label: "Delete Brand",
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
        data={brands}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No brands found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <CustomDialog
        isOpen={openDelete}
        onClose={handleCloseDialog}
        title={`Delete ${selectedBrand?.name}?`}
        description="This action will permanently remove the brand."
        modalType="confirmation"
        onConfirm={() => handleDeleteBrand(selectedBrand?._id)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default BrandTable;
