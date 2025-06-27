import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { fetchBreeds } from "../helpers/fetchBreeds";
import { deleteBreed } from "../helpers/deleteBreed";
import { useNavigate } from "react-router";

const BreedsTable = ({ setBreedLength, params, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: breedsRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["breeds", params],
    queryFn: () => fetchBreeds({ params }),
  });

  const total = breedsRes?.data?.length || 0;
  const breeds = breedsRes?.data || [];

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
    mutationFn: deleteBreed,
    onSuccess: () => {
      toast.success("Breed deleted successfully.");
      queryClient.invalidateQueries(["categories"]);
      handleCloseDialog();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete breed.");
    },
  });

  const handleDeleteAdmin = (id) => {
    deleteAdminMutation(id);
  };

  const onEditBreed = (row) => {
    navigate(`/dashboard/breed/edit/${row._id}`);
  };

  useEffect(() => {
    setBreedLength(total);
  }, [breeds]);

const columns = [
  {
    key: "name",
    label: "Name",
    render: (value) => (
      <Typography variant="p" className="font-medium">
        {value || "Unnamed"}
      </Typography>
    ),
  },
  {
    key: "image",
    label: "Image",
    render: (value, row) => (
      <div className="w-14 h-14 overflow-hidden rounded-md bg-gray-100">
        <img
          src={value || "/placeholder.png"}
          alt={row?.name || "Breed Image"}
          className="object-cover w-full h-full"
        />
      </div>
    ),
  },
  {
    key: "species",
    label: "Species",
    render: (value) => (
      <Typography className="capitalize text-sm text-gray-700">
        {value}
      </Typography>
    ),
  },
  {
    key: "description",
    label: "Description",
    render: (value) => (
      <Typography className="text-sm text-gray-600 line-clamp-2">
        {(value || "").slice(0, 20) + (value?.length > 20 ? "..." : "")}
      </Typography>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (value, row) => (
      <ActionMenu
        options={[
          {
            label: "Edit Breed",
            icon: Pencil,
            action: () => onEditBreed(row),
          },
          {
            label: "Delete Breed",
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
        data={breeds}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No Breeds found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <CustomDialog
        isOpen={openDelete}
        onClose={handleCloseDialog}
        title={`Delete ${selectedAdmin?.name}?`}
        description="This action will permanently remove the breed account."
        modalType="confirmation"
        onConfirm={() => handleDeleteAdmin(selectedAdmin?._id)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default BreedsTable;
