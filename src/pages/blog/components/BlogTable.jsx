import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import ActionMenu from "@/components/action_menu";
import { Pencil, Trash2, Eye } from "lucide-react";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/custom_dialog";
import { toast } from "sonner";
import { fetchBlogs } from "../helpers/fetchBlogs";
import { deleteBlog } from "../helpers/deleteBlog";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";

const BlogTable = ({ setBlogLength, params, setParams }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: blogsRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blogs", params],
    queryFn: () => fetchBlogs({ params }),
  });

  console.log(blogsRes);

  const total = blogsRes?.response?.data?.total || 0;
  const blogs = blogsRes?.response?.data?.blogs || [];

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const handleOpenDialog = (blog) => {
    setOpenDelete(true);
    setSelectedBlog(blog);
  };

  const handleCloseDialog = () => {
    setOpenDelete(false);
    setSelectedBlog(null);
  };

  const { mutate: deleteBlogMutation, isLoading: isDeleting } = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      toast.success("Blog deleted successfully.");
      queryClient.invalidateQueries(["blogs"]);
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Failed to delete blog.");
    },
  });

  const handleDeleteBlog = (id) => {
    deleteBlogMutation(id);
  };

  const onEditBlog = (row) => {
    navigate(`/dashboard/blog/edit/${row._id}`);
  };

  useEffect(() => {
    setBlogLength(total);
  }, [total, setBlogLength]);

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (value, row) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          {row?.image ? (
            <img
              src={row.image}
              alt={row.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Eye size={20} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <Typography className="font-medium">{row?.title.length > 20 ? `${row?.title.substring(0, 20)}...` : row?.title || "N/A"}</Typography>
          <Typography className="text-gray-500 text-sm">
            {row?.description.length > 20 ? `${row?.description.substring(0, 20)}...` : row?.description || "N/A"}
          </Typography>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value, row) => (
        <Typography>{row?.category || "Uncategorized"}</Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => (
        <Badge variant={row?.isPublished ? "default" : "secondary"}>
          {row?.isPublished ? "Published" : "Unpublished"}
        </Badge>
      ),
    },
    {
      key: "tags",
      label: "Tags",
      render: (value, row) => {
        // Handle both array and string cases
        const tags = Array.isArray(row?.tags) ? row.tags : 
                    (typeof row?.tags === 'string' ? row.tags.split(',').map(tag => tag.trim()) : []);
        
        return (
          <div className="flex flex-wrap gap-1.5">
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 font-medium"
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <Typography className="text-gray-400 text-sm italic">No tags</Typography>
            )}
          </div>
        );
      },
    },
    {
      key: "totalViews",
      label: "Views",
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <Eye size={16} className="text-gray-500" />
          <Typography className="font-medium">
            {row?.totalViews || 0}
          </Typography>
        </div>
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
              label: "Edit Blog",
              icon: Pencil,
              action: () => onEditBlog(row),
            },
            {
              label: "Delete Blog",
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
        data={blogs}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No blogs found"
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <CustomDialog
        isOpen={openDelete}
        onClose={handleCloseDialog}
        title={`Delete ${selectedBlog?.title}?`}
        description="This action will permanently remove the blog."
        modalType="confirmation"
        onConfirm={() => handleDeleteBlog(selectedBlog?._id)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default BlogTable; 