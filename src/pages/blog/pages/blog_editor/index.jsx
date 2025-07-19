import NavbarItem from "@/components/navbar/navbar_items";
import BlogForm from "./components/BlogForm";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { getBlogById } from "./helper/getBlogById";

const BlogEditor = () => {
  const { id } = useParams();

  const { data: initialDataRes, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlogById({ id }),
    enabled: !!id,
  });
  const initialData = initialDataRes?.response?.data || initialDataRes?.data || initialDataRes?.message;

  const breadcrumbs = [
    {
      title: "Blogs",
      isNavigation: true,
      path: "/dashboard/blog",
    },
    { title: id ? "Edit Blog" : "Add Blog", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <NavbarItem title="Blog" breadcrumbs={breadcrumbs} />
      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex flex-1 justify-center items-center">
            <CustomSpinner />
          </div>
        ) : (
          <BlogForm initialData={initialData} isEdit={!!id} />
        )}
      </div>
    </div>
  );
};

export default BlogEditor; 