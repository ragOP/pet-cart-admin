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
import { fetchCoupons } from "../helpers/fetchCoupons";
import { deleteCoupon } from "../helpers/deleteCoupon";

const CouponsTable = ({ setCouponsLength, params }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: coupons = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["coupons", params],
    queryFn: () => fetchCoupons({ params }),
    select: (data) => data?.response?.data?.data,
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const handleOpenDialog = (coupon) => {
    setOpenDelete(true);
    console.log("Selected Coupon:", coupon);
    setSelectedCoupon(coupon);
  };

  const handleCloseDialog = () => {
    setOpenDelete(false);
    setSelectedCoupon(null);
  };

  const { mutate: deleteCouponMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: (res) => {
      if (res?.response?.success) {
        toast.success("Coupon deleted successfully.");
        queryClient.invalidateQueries(["coupons"]);
        handleCloseDialog();
      } else {
        console.log(res, "res");
        toast.error(
          res?.response?.data?.message || "Failed to delete coupon."
        );
      }
    },
    onError: () => {
      toast.error("Failed to delete coupon.");
    },
  });

  const handleDeleteCoupon = (id) => {
    deleteCouponMutation(id);
  };

  const onEditCoupon = (coupon) => {
    navigate(`/dashboard/coupons/edit/${coupon._id}`);
  };

  useEffect(() => {
    setCouponsLength(coupons?.length || 0);
  }, [coupons]);

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (value) => (
        <Typography variant="p" className="font-medium uppercase">
          {value}
        </Typography>
      ),
    },
    {
      key: "discountType",
      label: "Type",
      render: (value) => (
        <span className="capitalize bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
          {value}
        </span>
      ),
    },
    {
      key: "discountValue",
      label: "Value",
      render: (value, row) => (
        <Typography>
          {row.discountType === "percentage" ? `${value}%` : `₹${value}`}
        </Typography>
      ),
    },
    {
      key: "startDate",
      label: "Valid From",
      render: (value) => (
        <Typography>{format(new Date(value), "dd/MM/yyyy")}</Typography>
      ),
    },
    {
      key: "endDate",
      label: "Valid Till",
      render: (value) => (
        <Typography>{format(new Date(value), "dd/MM/yyyy")}</Typography>
      ),
    },
    {
      key: "isExpired",
      label: "Expired",
      render: (_, row) => {
        const isExpired = row?.endDate && new Date(row.endDate) < new Date();
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              isExpired
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isExpired ? "Yes" : "No"}
          </span>
        );
      },
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
      key: "active",
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
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionMenu
          options={[
            {
              label: "Edit Coupon",
              icon: Pencil,
              action: () => onEditCoupon(row),
            },
            {
              label: "Delete Coupon",
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
        data={coupons}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No coupons available"
      />

      <CustomDialog
        onOpen={openDelete}
        onClose={handleCloseDialog}
        title={`Delete coupon "${selectedCoupon?.code}"?`}
        description="This will permanently remove the coupon and cannot be undone."
        modalType="Delete"
        onDelete={() => handleDeleteCoupon(selectedCoupon?._id)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default CouponsTable;
