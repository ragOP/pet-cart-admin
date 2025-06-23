import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdminId } from "@/redux/admin/adminSelector";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { createSubCategory } from "../helper/createSubCategory";
import { updateSubCategory } from "../helper/updateSubCategory";
import { slugify } from "@/utils/convert_to_slug";
import { urlToFile } from "@/utils/file/urlToFile";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories"; 

const CategoryFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(3, "Description is required"),
  categoryId: z.string().min(1, "Please select a category"),
  image: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true; // Skip if no file (optional)
        const file = files[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
        return allowedTypes.includes(file.type);
      },
      {
        message: "Only JPG, JPEG, PNG, or GIF images are allowed",
      }
    ),
});

const CategoryForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const adminId = useSelector(selectAdminId);
  const [imageFile, setImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const form = useForm({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      image: null,
    },
  });

  const {
    data: categoryListRes,
    isLoading: categoryLoading,
  } = useQuery({
    queryKey: ["all_categories"],
    queryFn: fetchCategories,
  });

  const categories = categoryListRes?.categories || [];
  console.log(categories);

  useEffect(() => {
    if (isEdit && initialData?.image && !imageFile) {
      const convert = async () => {
        const file = await urlToFile(initialData.image, "existing_image.jpg");
        if (file) {
          setImageFile(file);
          form.setValue("image", [file]);
        }
      };
      convert();
    }
  }, [isEdit, initialData, form, imageFile]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("slug", slugify(formData.name));
      payload.append("description", formData.description);
      payload.append("categoryId", formData.categoryId);

      if (!imageRemoved && imageFile instanceof File) {
        payload.append("images", imageFile);
      }

      if (isEdit) {
        return await updateSubCategory({ id: initialData._id, payload });
      } else {
        payload.append("createdBy", adminId);
        return await createSubCategory(payload);
      }
    },
    onSuccess: (res) => {
      if (res?.success || res?.response?.success) {
        toast.success(`SubCategory ${isEdit ? "updated" : "created"} successfully`);
        navigate("/dashboard/sub_category");
      } else {
        toast.error(res?.response?.message || "Failed to process subcategory");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} subcategory`);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SubCategory Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter subcategory name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter subcategory description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Category Dropdown */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>Upload Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageRemoved(false);
                      setImageFile(file);
                      form.setValue("image", [file]);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Preview + Delete */}
        {imageFile && !imageRemoved && (
          <div className="relative mt-4 w-64">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="preview"
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
              onClick={() => {
                setImageFile(null);
                setImageRemoved(true);
                form.setValue("image", null);
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Processing..."
            : isEdit
            ? "Update SubCategory"
            : "Create SubCategory"}
        </Button>
      </form>
    </Form>
  );
};

export default CategoryForm;
