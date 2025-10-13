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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdminId } from "@/redux/admin/adminSelector";
import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";

import { createCollection } from "../helper/createCollection";
import { updateCollection } from "../helper/updateCollection";
import { slugify } from "@/utils/convert_to_slug";
import { urlToFile } from "@/utils/file/urlToFile";
import { fetchSubCategories } from "@/pages/sub_category/helpers/fetchSubCategories";
import MultiSelectProducts from "./MultiProductSelect";
import { fetchProducts } from "@/pages/product/helpers/fetchProducts";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories";

const CollectionFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(3, "Description is required"),
  categoryId: z.string().min(1, "Please select a category"),
  subCategoryId: z.string().min(1, "Please select a subcategory"),
  productsIds: z.array(z.string()).default([]),
  image: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true; // Skip if no file (optional)
        const file = files[0];
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/gif",
          "image/webp",
        ];
        return allowedTypes.includes(file.type);
      },
      {
        message: "Only JPG, JPEG, PNG, WEBP or GIF images are allowed",
      }
    ),
});

const CollectionForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const adminId = useSelector(selectAdminId);
  const [imageFile, setImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");

  const form = useForm({
    resolver: zodResolver(CollectionFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      categoryId: "",
      subCategoryId: initialData?.subCategoryId || "",
      productsIds: initialData?.productsIds || initialData?.productIds || [],
      image: null,
    },
  });
  const { data: categoryListRes, isLoading: categoryLoading } = useQuery({
    queryKey: ["all_categories"],
    queryFn: () => fetchCategories({ params: { per_page: 100 } }),
  });

  const { data: subCategoryListRes, isLoading: subCategoryLoading } = useQuery({
    queryKey: ["all_sub_categories"],
    queryFn: () => fetchSubCategories({ params: { per_page: 100 } }),
  });

  console.log(subCategoryListRes, "subCategoryListRes");

  const { data: productListRes } = useQuery({
    queryKey: ["all_products", subCategoryId],
    queryFn: () => fetchProducts({
      params: {
        per_page: 100,
        ...(subCategoryId && { subCategorySlug: subCategoryListRes?.data?.find(sub => sub._id?.toString() === subCategoryId?.toString())?.slug })
      }
    }),
    enabled: !!subCategoryId, // Only fetch when subcategory is selected
  });
  const categories = categoryListRes?.data?.categories || [];

  const products = productListRes?.data || [];

  const subCategories = subCategoryListRes?.data || [];
  console.log(subCategories, "subCategories");

  // Get filtered subcategories, but also include the currently selected one if editing
  const filteredSubCategories = useMemo(() => {
    if (categoryId) {
      return subCategories.filter((sub) => sub.categoryId === categoryId);
    }
    // If editing and we have a selected subcategory but no category selected yet, include it
    if (isEdit && initialData?.subCategoryId) {
      const selectedSub = subCategories.find(sub => sub._id === initialData.subCategoryId);
      return selectedSub ? [selectedSub] : [];
    }
    return [];
  }, [categoryId, subCategories, isEdit, initialData?.subCategoryId]);
  console.log(filteredSubCategories, "filtered subCategories");

  // Initial category and subcategory derivation when subcategories are loaded
  useEffect(() => {
    if (isEdit && initialData?.subCategoryId && subCategories.length > 0 && !categoryId) {
      const selectedSubCategory = subCategories.find(sub => sub._id === initialData.subCategoryId);
      if (selectedSubCategory) {
        const derivedCategoryId = selectedSubCategory.categoryId;
        setCategoryId(derivedCategoryId);
        setSubCategoryId(initialData.subCategoryId);
        form.setValue("categoryId", derivedCategoryId);
        console.log("Initial category derivation:", derivedCategoryId);
        console.log("Initial subcategory set:", initialData.subCategoryId);
      }
    }
  }, [isEdit, initialData?.subCategoryId, subCategories, categoryId, form]);

  // Reset form when initialData changes
  useEffect(() => {
    if (isEdit && initialData && subCategories.length > 0) {
      console.log("Initial data for editing:", initialData);
      // Handle both productsIds and productIds for API consistency
      const productIds = initialData.productsIds || initialData.productIds || [];
      console.log("Product IDs to set:", productIds);

      // Derive categoryId from subcategory since it's not provided by backend
      let derivedCategoryId = "";
      if (initialData.subCategoryId) {
        const selectedSubCategory = subCategories.find(sub => sub._id === initialData.subCategoryId);
        if (selectedSubCategory) {
          derivedCategoryId = selectedSubCategory.categoryId;
          console.log("Derived category ID from subcategory:", derivedCategoryId);
        }
      }

      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        categoryId: derivedCategoryId,
        subCategoryId: initialData.subCategoryId || "",
        productsIds: productIds,
        image: null,
      });
      setCategoryId(derivedCategoryId);
    }
  }, [isEdit, initialData, form, subCategories]);

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
      payload.append("subCategoryId", formData.subCategoryId);
      // Ensure productsIds is always an array and handle single/multiple products
      const productIds = Array.isArray(formData.productsIds) ? formData.productsIds : [];
      console.log("Product IDs to send:", productIds);

      // Send product IDs using array notation (like other forms in the codebase)
      if (productIds.length > 0) {
        productIds.forEach((id) => {
          payload.append("productIds[]", id);
        });
      }

      if (!imageRemoved && imageFile instanceof File) {
        payload.append("images", imageFile);
      }

      if (isEdit) {
        return await updateCollection({ id: initialData._id, payload });
      } else {
        payload.append("createdBy", adminId);
        return await createCollection(payload);
      }
    },
    onSuccess: (res) => {
      if (res?.success || res?.response?.success) {
        queryClient.invalidateQueries(["collection", initialData?._id]);
        toast.success(
          `Collection ${isEdit ? "updated" : "created"} successfully`
        );
        navigate("/dashboard/collection");
      } else {
        toast.error(res?.response?.message || "Failed to process collection");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} collection`);
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
              <FormLabel>Collection Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter collection name" {...field} />
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
                <Input placeholder="Enter collection description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                  onChange={(e) => {
                    field.onChange(e);
                    setCategoryId(e.target.value);
                  }}
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

        {/* Parent SubCategory Dropdown */}
        <FormField
          control={form.control}
          name="subCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SubCategory</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                  onChange={(e) => {
                    field.onChange(e);
                    setSubCategoryId(e.target.value);
                    // Reset selected products when subcategory changes
                    form.setValue("productsIds", []);
                  }}
                >
                  <option value="">Select a subcategory</option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productsIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Products</FormLabel>
              <FormControl>
                <div>
                  {!subCategoryId ? (
                    <div className="w-full border rounded px-3 py-2 text-sm text-gray-500 bg-gray-50">
                      Please select a subcategory first to load products
                    </div>
                  ) : (
                    <MultiSelectProducts
                      products={products}
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={(selectedIds) => {
                        // Ensure we always pass an array, even for single selection
                        field.onChange(Array.isArray(selectedIds) ? selectedIds : [selectedIds].filter(Boolean));
                      }}
                    />
                  )}
                </div>
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
              ? "Update Collection"
              : "Create Collection"}
        </Button>
      </form>
    </Form>
  );
};

export default CollectionForm;
