/*
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Pencil, Trash2 } from "lucide-react";

import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import ActionMenu from "@/components/action_menu";
import { CustomDialog } from "@/components/custom_dialog";
import { fetchHsnCodes } from "../helpers/fetchHsnCodes";
import { deleteHsnCodes } from "../helpers/deleteHsnCodes";


const HsnCodesTable = ({ setHsnCodesLength, params }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: hsnCodes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hsn_codes", params],
    queryFn: () => fetchHsnCodes({ params }),
    select: (data) => data?.response?.data?.data,
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedHsnCode, setSelectedHsnCode] = useState(null);

  const handleOpenDialog = (hsnCode) => {
    setOpenDelete(true);
    setSelectedHsnCode(hsnCode);
  };

  const handleCloseDialog = () => {
    setOpenDelete(false);
    setSelectedHsnCode(null);
  };

  const { mutate: deleteHsnCodeMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteHsnCodes,
    onSuccess: (res) => {
      if (res?.response?.success) {
        toast.success("HSN Code deleted successfully.");
        queryClient.invalidateQueries(["hsn_codes"]);
        handleCloseDialog();
      } else {
        toast.error(
          res?.response?.data?.message || "Failed to delete HSN Code."
        );
      }
    },
    onError: () => {
      toast.error("Failed to delete HSN Code.");
    },
  });

  const handleDeleteHsnCode = (id) => {
    deleteHsnCodeMutation(id);
  };

  const onEditHsnCode = (hsnCode) => {
    navigate(`/dashboard/hsn_codes/edit/${hsnCode._id}`);
  };

  useEffect(() => {
    setHsnCodesLength(hsnCodes?.length || 0);
  }, [hsnCodes]);

  const columns = [
    {
      key: "hsn_code",
      label: "HSN Code",
      render: (value) => (
        <Typography variant="p" className="font-medium">
          {value}
        </Typography>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-sm max-w-[20vw] break-words whitespace-normal">
          {value || "—"}
        </span>
      ),
    },
    {
      key: "cgst_rate",
      label: "CGST Rate (%)",
      render: (value) => <span>{value ?? "—"}</span>,
    },
    {
      key: "sgst_rate",
      label: "SGST Rate (%)",
      render: (value) => <span>{value ?? "—"}</span>,
    },
    {
      key: "igst_rate",
      label: "IGST Rate (%)",
      render: (value) => <span>{value ?? "—"}</span>,
    },
    {
      key: "cess",
      label: "Cess (%)",
      render: (value) => <span>{value ?? "—"}</span>,
    },
    {
      key: "is_active",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value, row) => (
        <div>
          <Typography>
            {format(new Date(value), "dd/MM/yyyy hh:mm a")}
          </Typography>
          {value !== row.updatedAt && (
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
      render: (_, row) => (
        <ActionMenu
          options={[
            {
              label: "Edit",
              icon: Pencil,
              action: () => onEditHsnCode(row),
            },
            {
              label: "Delete",
              icon: Trash2,
              action: () => handleOpenDialog(row),
              className: "text-red-500",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <CustomTable
        columns={columns}
        data={hsnCodes}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No HSN Codes available"
      />

      <CustomDialog
        onOpen={openDelete}
        onClose={handleCloseDialog}
        title={`Delete HSN Code "${selectedHsnCode?.hsn_code}"?`}
        description="This will permanently remove the HSN Code and cannot be undone."
        modalType="Delete"
        onDelete={() => handleDeleteHsnCode(selectedHsnCode?._id)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default HsnCodesTable;
*/
