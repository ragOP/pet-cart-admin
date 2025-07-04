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
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { slugify } from "@/utils/convert_to_slug";
import { urlToFile } from "@/utils/file/urlToFile";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories"; 

import { createBreed } from "../helper/createBreed";
import { updateBreed } from "../helper/updateBreed";

const BreedFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(3, "Description is required"),
  species: z.enum(["dog", "cat", "rabbit", "horse"], {
    required_error: "Please select a species",
  }),
  image: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true; // Skip if no file (optional)
        const file = files[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
        return allowedTypes.includes(file.type);
      },
      {
        message: "Only JPG, JPEG, PNG, or GIF images are allowed",
      }
    ),
});

const BreedForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const adminId = useSelector(selectAdminId);
  const [imageFile, setImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const form = useForm({
    resolver: zodResolver(BreedFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      species: initialData?.species || "",
      image: null,
    },
  });

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
      payload.append("species", formData.species);

      if (!imageRemoved && imageFile instanceof File) {
        payload.append("images", imageFile);
      }

      if (isEdit) {
        return await updateBreed({ id: initialData._id, payload });
      } else {
        payload.append("createdBy", adminId);
        return await createBreed(payload);
      }
    },
    onSuccess: (res) => {
      if (res?.success || res?.response?.success) {
        queryClient.invalidateQueries(["breed", initialData?._id]);
        toast.success(`Breed ${isEdit ? "updated" : "created"} successfully`);
        navigate("/dashboard/breed");
      } else {
        toast.error(res?.response?.message || "Failed to process breed");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} breed`);
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
              <FormLabel>Breed Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter breed name" {...field} />
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
                <Input placeholder="Enter breed description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Species Dropdown */}
        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                >
                  <option value="">Select species</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="horse">Horse</option>
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
            ? "Update Breed"
            : "Create Breed"}
        </Button>
      </form>
    </Form>
  );
};

export default BreedForm;
