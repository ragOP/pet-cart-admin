import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2 } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { fetchCollections } from "../helpers/fetchCollections";
import { deleteCollection } from "../helpers/deleteCollection";
import { useNavigate } from "react-router";

const CollectionsTable = ({ setCollectionLength, params, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: collectionsRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["collections", params],
    queryFn: () => fetchCollections({ params }),
  });

  const collections = collectionsRes?.data || [];
  const total = collectionsRes?.total || 0;

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const handleOpenDialog = (collection) => {
    setOpenDelete(true);
    setSelectedCollection(collection);
  };

  const handleCloseDialog = () => {
    setOpenDelete(false);
    setSelectedCollection(null);
  };

  const { mutate: deleteCollectionMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      toast.success("Collection deleted successfully.");
      queryClient.invalidateQueries(["collections"]);
      handleCloseDialog();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete collection.");
    },
  });

  const handleDelete = (id) => {
    deleteCollectionMutation(id);
  };

  const onEditCollection = (row) => {
    navigate(`/dashboard/collection/edit/${row._id}`);
  };

  useEffect(() => {
    setCollectionLength(total);
  }, [collections]);

  // useEffect(() => {
  //   const fetchSubCategories = async () => {
  //     const enriched = await Promise.all(
  //       collections.map(async (col) => {
  //         try {
  //           const res = await getSubCategoryById({ id: col.subCategoryId });
  //           console.log(res?.response?.data)
  //           return {
  //             ...col,
  //             subCategoryName: res?.response?.data?.name || "Unknown",
  //           };
  //         } catch (e) {
  //           return {
  //             ...col,
  //             subCategoryName: "Unknown",
  //           };
  //         }
  //       })
  //     );
  //     setCollectionsWithSubCategory(enriched);
  //   };

  //   if (collections.length > 0) fetchSubCategories();
  // }, [collections]);

  const columns = [
    {
      key: "name",
      label: "Name & Slug",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="p" className="font-medium">
            {value}
          </Typography>
          <Typography variant="small" className="text-gray-500">
            {row?.slug}
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
            alt={row?.name || "Collection Image"}
            className="object-cover w-full h-full"
          />
        </div>
      ),
    },
    // {
    //   key: "subCategoryId",
    //   label: "Sub Category",
    //   render: (value, row) => (
    //     <Typography className="text-sm text-gray-700">
    //       {row?.subCategoryName || "Unknown"}
    //     </Typography>
    //   ),
    // },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <Typography className="text-sm text-gray-600">
          {(value || "").slice(0, 20) + (value?.length > 20 ? "..." : "")}
        </Typography>
      ),
    },
    {
      key: "productIds",
      label: "No. of Products",
      render: (value) => (
        <Typography className="text-sm font-medium">
          {value?.length || 0}
        </Typography>
      ),
    },
    // {
    //   key: "createdAt",
    //   label: "Created On",
    //   render: (value, row) => (
    //     <div className="flex flex-col gap-1">
    //       <Typography>
    //         {row?.createdAt
    //           ? format(new Date(row.createdAt), "dd/MM/yyyy")
    //           : "N/A"}
    //       </Typography>
    //       {row?.updatedAt && row.createdAt !== row.updatedAt && (
    //         <Typography className="text-gray-500 text-sm">
    //           Updated{" "}
    //           {formatDistanceToNow(new Date(row.updatedAt), {
    //             addSuffix: true,
    //           })}
    //         </Typography>
    //       )}
    //     </div>
    //   ),
    // },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <ActionMenu
          options={[
            {
              label: "Edit Collection",
              icon: Pencil,
              action: () => onEditCollection(row),
            },
            {
              label: "Delete Collection",
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
        data={collections}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No collections found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <CustomDialog
        isOpen={openDelete}
        onClose={handleCloseDialog}
        title={`Delete ${selectedCollection?.name}?`}
        description="This action will permanently remove the collection."
        modalType="confirmation"
        onConfirm={() => handleDelete(selectedCollection?._id)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default CollectionsTable;
