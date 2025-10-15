import { useQuery } from "@tanstack/react-query";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { fetchAbandonedOrders } from "../helpers/fetchAbandonedOrders";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/utils/format_price";
import { formatDateWithAgo } from "@/utils/format_date";
import { useNavigate } from "react-router-dom";
import { Eye, Package } from "lucide-react";
import ActionMenu from "@/components/action_menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AbandonedOrdersTable = ({
  setAbandonedOrdersLength,
  params,
  setParams,
  selectedRows,
  setSelectedRows,
}) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const {
    data: AbandonedOrdersRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["AbandonedOrders", params],
    queryFn: () => fetchAbandonedOrders({ params }),
  });

  const total = AbandonedOrdersRes?.total || 0;
  const abandonedOrders = AbandonedOrdersRes?.abandonedOrders || [];

  useEffect(() => {
    setAbandonedOrdersLength(AbandonedOrdersRes?.abandonedOrders?.length || 0);
  }, [AbandonedOrdersRes?.abandonedOrders, setAbandonedOrdersLength]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(abandonedOrders);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (row, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, row]);
    } else {
      setSelectedRows(selectedRows.filter((r) => r._id !== row._id));
    }
  };

  const isRowSelected = (row) => {
    return selectedRows.some((r) => r._id === row._id);
  };

  const isAllSelected =
    abandonedOrders.length > 0 &&
    selectedRows.length === abandonedOrders.length;

  const onViewDetails = (row) => {
    navigate(`/dashboard/abandoned-orders/${row._id}`);
  };

  const handleShowAllItems = (items) => {
    setSelectedItems(items);
    setDialogOpen(true);
  };

  const columns = [
    {
      key: "select",
      label: (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
        />
      ),
      render: (value, row) => (
        <Checkbox
          checked={isRowSelected(row)}
          onCheckedChange={(checked) => handleSelectRow(row, checked)}
          aria-label={`Select row ${row._id}`}
        />
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (value, row) => (
        <div className="flex flex-col">
          <Typography className="font-semibold">
            {row?.userId?.name || "N/A"}
          </Typography>
          <Typography className="text-sm text-gray-600">
            {row?.userId?.phoneNumber || "No Phone"}
          </Typography>
          <Typography className="text-xs text-gray-600">
            {row?.userId?.email || "No Email"}
          </Typography>
        </div>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (value, row) => (
        <div className="flex flex-col gap-1 max-w-xs">
          {row.items.slice(0, 3).map((item, index) => (
            <Typography key={index} className="text-sm text-gray-800">
              •{" "}
              {item?.productId?.title?.length > 30
                ? item.productId.title.slice(0, 30) + "..."
                : item?.productId?.title || "Product"}{" "}
              ({item.quantity}×)
            </Typography>
          ))}
          {row.items.length > 3 && (
            <Typography
              className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
              onClick={() => handleShowAllItems(row.items)}
            >
              +{row.items.length - 3} more items
            </Typography>
          )}
        </div>
      ),
    },
    {
      key: "itemCount",
      label: "Items",
      render: (value, row) => (
        <Typography className="text-sm font-medium">
          {row.items.length}
        </Typography>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (value, row) => (
        <Typography className="font-medium text-sm">
          {formatPrice(row.total_price)}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => (
        <span
          className={`capitalize px-3 py-1 rounded-full text-sm ${
            row.is_active
              ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Abandoned On",
      render: (value, row) => {
        const { display, subtext, isRecent } = formatDateWithAgo(row.createdAt);
        return (
          <div className="flex flex-col">
            <Typography className="text-sm font-medium">
              {display}
            </Typography>
            <Typography className={`text-xs ${isRecent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>
              {subtext}
            </Typography>
          </div>
        );
      },
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      render: (value, row) => {
        const { display, subtext, isRecent } = formatDateWithAgo(row.updatedAt);
        return (
          <div className="flex flex-col">
            <Typography className="text-sm font-medium">
              {display}
            </Typography>
            <Typography className={`text-xs ${isRecent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
              {subtext}
            </Typography>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <ActionMenu
          options={[
            {
              label: "View Details",
              icon: Eye,
              action: () => onViewDetails(row),
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
        data={abandonedOrders}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No Abandoned Orders found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {/* All Items Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="min-w-[50vw] max-w-[50vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Cart Items ({selectedItems.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedItems.map((item, index) => {
              // Use variant data if available, otherwise use product data
              const hasVariant = item?.variantId && typeof item.variantId === 'object';
              const displayImage = hasVariant 
                ? (item.variantId.images?.[0] || item?.productId?.images?.[0])
                : item?.productId?.images?.[0];
              const displayLabel = hasVariant
                ? item.variantId.variantName
                : item?.productId?.productLabel;
              
              return (
                <div
                  key={index}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={item?.productId?.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <Typography className="font-semibold">
                      {item?.productId?.title || "Product"}
                    </Typography>
                    <div className="flex items-center gap-2">
                      <Typography className="text-sm text-gray-600">
                        {displayLabel || ""}
                      </Typography>
                      {hasVariant && (
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                          Variant
                        </span>
                      )}
                    </div>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <div>
                      <Typography className="text-xs text-gray-500">Price</Typography>
                      <Typography className="font-medium">
                        {formatPrice(item?.price)}
                      </Typography>
                    </div>
                    <div>
                      <Typography className="text-xs text-gray-500">Quantity</Typography>
                      <Typography className="font-medium">{item?.quantity}</Typography>
                    </div>
                    <div>
                      <Typography className="text-xs text-gray-500">Total</Typography>
                      <Typography className="font-medium text-primary">
                        {formatPrice(item?.total)}
                      </Typography>
                    </div>
                    <div>
                      <Typography className="text-xs text-gray-500">Weight</Typography>
                      <Typography className="font-medium">{item?.weight}g</Typography>
                    </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total Summary */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <Typography className="text-lg font-semibold">Total Amount:</Typography>
                <Typography className="text-2xl font-bold text-primary">
                  {formatPrice(
                    selectedItems.reduce((sum, item) => sum + (item?.total || 0), 0)
                  )}
                </Typography>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AbandonedOrdersTable;

