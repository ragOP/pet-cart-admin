import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { createBlog } from "../helper/createBlog";
import { updateBlog } from "../helper/updateBlog";
import { slugify } from "@/utils/convert_to_slug";
import { urlToFile } from "@/utils/file/urlToFile";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories";

const BlogFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isBanner: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
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
        message: "Only JPG, JPEG, PNG, WEBP, or GIF images are allowed",
      }
    ),
});

const BlogForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Fetch categories
  const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories({ params: { per_page: 100 } }),
  });

  const categories = categoriesRes?.data?.categories || [];

  const form = useForm({
    resolver: zodResolver(BlogFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      slug: initialData?.slug || "",
      category: "",
      isPublished: initialData?.isPublished || false,
      isFeatured: initialData?.isFeatured || false,
      isBanner: initialData?.isBanner || false,
      tags: initialData?.tags
        ? Array.isArray(initialData.tags)
          ? initialData.tags
              .flatMap((tag) =>
                typeof tag === "string" && tag.includes(",")
                  ? tag
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t)
                  : [tag]
              )
              .filter((tag) => tag && tag.trim())
          : []
        : [],
      image: null,
    },
  });

  // Auto-generate slug from title
  const watchedTitle = form.watch("title");
  useEffect(() => {
    if (watchedTitle && !isEdit) {
      const generatedSlug = slugify(watchedTitle);
      form.setValue("slug", generatedSlug);
    }
  }, [watchedTitle, form, isEdit]);

  // Convert URL to file for edit mode preview
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

  // Set category when categories are loaded and initialData is available
  useEffect(() => {
    if (isEdit && initialData && categories.length > 0) {
      // Try to find the category by name first (for backward compatibility)
      const categoryByName = categories.find(
        (cat) => cat.name === initialData.category
      );
      // Try to find by ID if categoryId exists
      const categoryById = initialData.categoryId?._id
        ? categories.find((cat) => cat._id === initialData.categoryId._id)
        : null;

      const selectedCategory = categoryById || categoryByName;

      if (selectedCategory) {
        form.setValue("category", selectedCategory._id);
      }
    }
  }, [isEdit, initialData, categories, form]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("content", formData.content);
      payload.append("slug", formData.slug);

      // Get category name from the selected category ID
      const selectedCategory = categories.find(
        (cat) => cat._id === formData.category
      );
      payload.append("category", selectedCategory?.name || "");

      payload.append("isPublished", formData.isPublished);
      payload.append("isFeatured", formData.isFeatured);
      payload.append("isBanner", formData.isBanner);

      // Send tags as array of strings
      formData.tags.forEach((tag, index) => {
        payload.append(`tags[${index}]`, tag);
      });

      if (!imageRemoved && imageFile instanceof File) {
        payload.append("image", imageFile);
      }

      if (isEdit) {
        return await updateBlog({ id: initialData._id, payload });
      } else {
        return await createBlog(payload);
      }
    },
    onSuccess: (res) => {
      if (res?.response?.success) {
        queryClient.invalidateQueries(["blog", initialData?._id]);
        queryClient.invalidateQueries(["blogs"]);
        toast.success(`Blog ${isEdit ? "updated" : "created"} successfully`);
        navigate("/dashboard/blog");
      } else {
        toast.error(res?.response?.message || "Failed to process blog");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} blog`);
    },
  });

  const onSubmit = (data) => {
    console.log("SUBMIT DATA", data);
    mutation.mutate(data);
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (indexToRemove) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blog Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter blog title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <Input placeholder="Enter blog slug" {...field} />
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
              <FormLabel>Blog Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter blog description"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter blog content..."
                  config={{
                    height: 400,
                    placeholder: "Enter blog content...",
                    toolbar: [
                      "source",
                      "|",
                      "bold",
                      "strikethrough",
                      "underline",
                      "italic",
                      "|",
                      "ul",
                      "ol",
                      "|",
                      "outdent",
                      "indent",
                      "|",
                      "font",
                      "fontsize",
                      "brush",
                      "paragraph",
                      "|",
                      "image",
                      "link",
                      "table",
                      "|",
                      "align",
                      "undo",
                      "redo",
                      "|",
                      "hr",
                      "eraser",
                      "copyformat",
                      "|",
                      "fullsize",
                    ],
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : "Select a category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus size={16} />
                  </Button>
                </div>

                {field.value?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-1 hover:bg-red-100 rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
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
              <FormLabel>Featured Image *</FormLabel>
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

        {/* Image Preview */}
        {(imageFile || (isEdit && initialData?.image && !imageRemoved)) && (
          <div className="space-y-2">
            <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
              <img
                src={
                  imageFile instanceof File
                    ? URL.createObjectURL(imageFile)
                    : initialData?.image
                }
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                onClick={() => {
                  setImageRemoved(true);
                  setImageFile(null);
                  form.setValue("image", null);
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Status Switches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publish Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Make this blog visible to public
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured Blog</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Display this blog as featured content
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isBanner"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Banner Blog</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Display this blog as a banner on the homepage
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="flex-1" disabled={mutation.isPending}>
          {mutation.isPending
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Blog"
            : "Create Blog"}
        </Button>
      </form>
    </Form>
  );
};

export default BlogForm;
