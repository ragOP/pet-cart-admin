import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { fetchProducts } from "../helpers/fetchProducts";
import { deleteProduct } from "../helpers/deleteProduct";
import { useNavigate } from "react-router";

const ProductsTable = ({ setProductLength, params, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: productsRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", params],
    queryFn: () =>
      fetchProducts({
        params: {
          ...params,
          perPage: params?.per_page ?? params?.perPage,
          page: params?.page,
        },
      }),
  });

  const total =
    Number(productsRes?.data?.total ?? productsRes?.total) || 0;
  const products = Array.isArray(productsRes?.data?.data)
    ? productsRes.data.data
    : Array.isArray(productsRes?.data)
    ? productsRes.data
    : Array.isArray(productsRes)
    ? productsRes
    : [];

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenDialog = (product) => {
    setOpenDelete(true);
    setSelectedProduct(product);
  };

  const handleCloseDialog = () => {
    setOpenDelete(false);
    setSelectedProduct(null);
  };

  const { mutate: deleteProductMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully.");
      queryClient.invalidateQueries(["products"]);
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Failed to delete product.");
    },
  });

  const handleDeleteProduct = (id) => {
    deleteProductMutation(id);
  };

  const onEditProduct = (row) => {
    navigate(`/dashboard/product/edit/${row._id}`);
  };

useEffect(() => {
  setProductLength(total);
}, [total, setProductLength]);

const columns = [
  {
    key: "title",
    label: "Title",
    render: (value, row) => (
      <div className="flex flex-col gap-1 max-w-[200px] truncate">
        <Typography variant="p" className="font-medium truncate">
          {value}
        </Typography>
        <Typography variant="small" className="text-gray-500 truncate">
          {row?.slug || "No Slug"}
        </Typography>
      </div>
    ),
  },
  {
    key: "images",
    label: "Image",
    render: (value, row) => (
      <div className="w-14 h-14 overflow-hidden rounded-md bg-gray-100">
        <img
          src={value?.[0] || "/placeholder.png"}
          alt={row?.title || "Product Image"}
          className="object-cover w-full h-full"
        />
      </div>
    ),
  },
  {
    key: "categoryId",
    label: "Category",
    render: (value, row) => (
      <Typography className="text-sm text-gray-700 truncate max-w-[120px]">
        {row?.categoryId?.name || "Unknown"}
      </Typography>
    ),
  },
  {
    key: "subCategoryId",
    label: "SubCategory",
    render: (value, row) => (
      <Typography className="text-sm text-gray-700 truncate max-w-[120px]">
        {row?.subCategoryId?.name || "Unknown"}
      </Typography>
    ),
  },
  {
    key: "brandId",
    label: "Brand",
    render: (value, row) => (
      <Typography className="text-sm text-gray-700 truncate max-w-[120px]">
        {row?.brandId?.name || "Unknown"}
      </Typography>
    ),
  },
  {
    key: "price",
    label: "Price",
    render: (value) => (
      <Typography className="text-sm">
        ₹{value}
      </Typography>
    ),
  },
  
  {
    key: "salePrice",
    label: "Sale Price",
    render: (value, row) => (
      <Typography className="text-sm">
        {row?.salePrice ? (
          <>
            ₹{row?.salePrice}
          </>
        ) : (
          "N/A"
        )}
      </Typography>
    ),
  },
  // {
  //   key: "variants",
  //   label: "Variants",
  //   render: (value) =>
  //     value && value.length > 0 ? (
  //       <div className="text-xs bg-gray-50 p-2 rounded max-w-[250px] overflow-x-auto space-y-1">
  //         {value.slice(0, 2).map((variant, idx) => (
  //           <div key={idx} className="flex flex-col border-b pb-1">
  //             <div>SKU: <span className="font-medium">{variant.sku}</span></div>
  //             <div>Price: ₹{variant.price}</div>
  //             <div>Stock: {variant.stock}</div>
  //           </div>
  //         ))}
  //         {value.length > 2 && (
  //           <div className="text-gray-400 italic text-xs">+{value.length - 2} more</div>
  //         )}
  //       </div>
  //     ) : (
  //       <Typography className="text-sm text-gray-500">N/A</Typography>
  //     ),
  // },
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
            label: "Edit Product",
            icon: Pencil,
            action: () => onEditProduct(row),
          },
          {
            label: "Delete Product",
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
      page,
    }));
  };

  const perPage = Number(params.per_page);
  const currentPage = Number(params.page);
  const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 1;

  return (
    <>
      <CustomTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No products found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <CustomDialog
        isOpen={openDelete}
        onClose={handleCloseDialog}
        title={`Delete ${selectedProduct?.title}?`}
        description="This action will permanently remove the product."
        modalType="confirmation"
        onConfirm={() => handleDeleteProduct(selectedProduct?._id)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default ProductsTable;
