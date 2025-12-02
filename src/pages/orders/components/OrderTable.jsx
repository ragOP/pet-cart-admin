import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect } from "react";
import { fetchOrders } from "../helpers/fetchOrders";
import { useNavigate } from "react-router";
import { formatPrice } from "@/utils/format_price";

const OrdersTable = ({ setOrdersLength, params, setParams }) => {
  const navigate = useNavigate();

  const {
    data: OrdersRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["Orders", params],
    queryFn: () => fetchOrders({ params }),
  });

  const total = OrdersRes?.total;
  const orders = OrdersRes?.orders;

  const onEditOrder = (row) => {
    navigate(`/dashboard/orders/edit/${row._id}`);
  };

  useEffect(() => {
    setOrdersLength(orders?.length);
  }, [orders]);

  const columns = [
    {
      key: "orderId",
      label: "Order ID",
      render: (value, row) => (
        <Typography className="font-medium text-sm">{row.orderId}</Typography>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (value, row) => (
        <div className="flex flex-col">
          <Typography className="font-semibold">{row?.address?.name || "N/A"}</Typography>
          <Typography className="text-sm text-gray-600">
            {row?.address?.mobile || "No Phone"}
          </Typography>
          <Typography className="text-sm text-gray-600">
            {row?.address?.email || "No Email"}
          </Typography>
        </div>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          {(row?.items || []).map((item, index) => {
            const rawTitle = item?.productId?.title;
            const safeTitle =
              typeof rawTitle === "string" && rawTitle.length > 0
                ? rawTitle.length > 20
                  ? rawTitle.slice(0, 20) + "..."
                  : rawTitle
                : "Unnamed product";

            return (
              <Typography key={index} className="text-sm text-gray-800">
                • {safeTitle} ({item?.quantity ?? 0}×)
              </Typography>
            );
          })}
        </div>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (value, row) => (
        <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
          {row.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
        </span>
      ),
    },
    {
      key: "couponCode",
      label: "Coupon",
      render: (value, row) => (
        <Typography className="text-sm text-gray-700">
          {row.couponCode || "—"}
        </Typography>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (value, row) => (
        <Typography className="font-medium text-sm">{formatPrice(row.totalAmount)}</Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => (
        <span className="capitalize bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm">
          {row.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Ordered On",
      render: (value, row) => (
        <div className="flex flex-col">
          <Typography className="text-sm">
            {format(new Date(row.createdAt), "dd MMM yyyy, hh:mm a")}
          </Typography>
          {row.updatedAt !== row.createdAt && (
            <Typography className="text-xs text-gray-500">
              Updated {formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true })}
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
              label: "Edit Order",
              icon: Pencil,
              action: () => onEditOrder(row),
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
        data={orders}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No Orders found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default OrdersTable;
