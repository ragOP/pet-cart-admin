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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdminId } from "@/redux/admin/adminSelector";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { createBrand } from "../helper/createBrand";
import { updateBrand } from "../helper/updateBrand";
import { slugify } from "@/utils/convert_to_slug";
import { urlToFile } from "@/utils/file/urlToFile";

const BrandFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(3, "Description is required"),
  logo: z
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
        message: "Only JPG, JPEG, PNG, GIF, or WEBP images are allowed",
      }
    ),
  active: z.boolean().default(true),
});


const BrandForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const adminId = useSelector(selectAdminId);
  const [logoFile, setLogoFile] = useState(null);
  const [logoRemoved, setLogoRemoved] = useState(false);

  const form = useForm({
    resolver: zodResolver(BrandFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      logo: null,
      active: initialData?.active ?? true,
    },
  });

  useEffect(() => {
    if (isEdit && initialData?.logo && !logoFile) {
      const convert = async () => {
        const file = await urlToFile(initialData.logo, "existing_logo.jpg");
        if (file) {
          setLogoFile(file);
          form.setValue("logo", [file]);
        }
      };
      convert();
    }
  }, [isEdit, initialData, form, logoFile]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("slug", slugify(formData.name));
      payload.append("description", formData.description);
      payload.append("active", formData.active);

      if (!logoRemoved && logoFile instanceof File) {
        payload.append("images", logoFile);
      }

      if (isEdit) {
        return await updateBrand({ id: initialData._id, payload });
      } else {
        payload.append("createdBy", adminId);
        return await createBrand(payload);
      }
    },
    onSuccess: (res) => {
      if (res?.success || res?.response?.success) {
        queryClient.invalidateQueries(["brand", initialData?._id]);
        toast.success(`Brand ${isEdit ? "updated" : "created"} successfully`);
        navigate("/dashboard/brand");
      } else {
        toast.error(res?.response?.message || "Failed to process brand");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} brand`);
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
              <FormLabel>Brand Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter brand name" {...field} />
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
                <Input placeholder="Enter brand description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo Upload */}
        <FormField
          control={form.control}
          name="logo"
          render={() => (
            <FormItem>
              <FormLabel>Upload Logo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setLogoRemoved(false);
                      setLogoFile(file);
                      form.setValue("logo", [file]);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo Preview + Delete */}
        {logoFile && !logoRemoved && (
          <div className="relative mt-4 w-64">
            <img
              src={URL.createObjectURL(logoFile)}
              alt="logo-preview"
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
              onClick={() => {
                setLogoFile(null);
                setLogoRemoved(true);
                form.setValue("logo", null);
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Active Toggle */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-4 h-4"
              />
              <FormLabel className="mb-0">Is Active</FormLabel>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Processing..."
            : isEdit
            ? "Update Brand"
            : "Create Brand"}
        </Button>
      </form>
    </Form>
  );
};

export default BrandForm;
