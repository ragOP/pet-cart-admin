import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Upload, Image as ImageIcon, Save, X } from "lucide-react";
import { updateCatLifeBanner } from "../../../helpers/updateCatLifeBanner";
import { createCatLifeBanner } from "../../../helpers/createCatLifeBanner";
import { urlToFile } from "@/utils/file/urlToFile";
import { validateImageDimensions } from "@/utils/validate_image_dimensions";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories";
import { fetchSubCategoriesByCategoryId } from "@/pages/sub_category/helpers/fetchSubCategories";

const CatLifeBannerForm = ({ initialData, isEdit, isLoading = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    link: "",
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoryListRes } = useQuery({
    queryKey: ["all_categories"],
    queryFn: fetchCategories,
  });

  const { data: subCategoryListRes } = useQuery({
    queryKey: ["subcategories", selectedCategoryId],
    queryFn: () =>
      fetchSubCategoriesByCategoryId({
        params: { categoryId: selectedCategoryId },
      }),
    enabled: !!selectedCategoryId,
  });


  console.log(categoryListRes?.data?.categories);
  console.log(subCategoryListRes?.data);
  
  const categories = categoryListRes?.data?.categories || [];
  const subCategories = subCategoryListRes?.data || [];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData && isEdit) {
      console.log("Initial data for editing:", initialData);
      setFormData({
        title: initialData.title || "",
        link: initialData.link || "",
      });

      // Convert existing image URL to file object if image exists
      if (initialData.image) {
        setPreviewUrl(initialData.image);
        const convertImage = async () => {
          try {
            const file = await urlToFile(initialData.image, "cat_life_banner.jpg");
            if (file) {
              setSelectedFile(file);
            }
          } catch (error) {
            console.error("Error converting image URL to file:", error);
          }
        };
        convertImage();
      }
    }
  }, [initialData, isEdit]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    // Reset file input
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const updateCatLifeBannerMutation = useMutation({
    mutationFn: updateCatLifeBanner,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("CatLifeBanner updated successfully");
        queryClient.invalidateQueries(["catLifeBanners"]);
        navigate("/dashboard/cat-life-banner");
      } else {
        toast.error(result.message || "Failed to update catLifeBanner");
      }
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("An error occurred while updating the catLifeBanner");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const createCatLifeBannerMutation = useMutation({
    mutationFn: createCatLifeBanner,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("CatLifeBanner created successfully");
        queryClient.invalidateQueries(["catLifeBanners"]);
        navigate("/dashboard/cat-life-banner");
      } else {
        toast.error(result.message || "Failed to create catLifeBanner");
      }
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("An error occurred while creating the catLifeBanner");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    // if (!formData.link.trim()) {
    //   toast.error("Please enter a link");
    //   return;
    // }

    if (!formData.categoryId.trim()) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.subCategoryId.trim()) {
      toast.error("Please select a subcategory");
      return;
    }

    if (!isEdit && !selectedFile) {
      toast.error("Please select an image");
      return;
    }

    // Additional validation for edit mode
    if (isEdit && !initialData?._id) {
      toast.error("CatLifeBanner data not loaded. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const link = createLinkUsingSelectedCategoryAndSubCategoryValues();
      const submitFormData = new FormData();

      // Add form fields
      submitFormData.append("isActive", formData.isActive.toString());

      // console.log(formData.link);
      submitFormData.append("link", link);
      submitFormData.append("title", formData.title);

      // Add image if selected
      if (selectedFile) {
        submitFormData.append("image", selectedFile);
      }

      if (isEdit) {
        updateCatLifeBannerMutation.mutate({
          id: initialData._id,
          formData: submitFormData,
        });
      } else {
        createCatLifeBannerMutation.mutate({
          formData: submitFormData,
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred while submitting the form");
      setIsSubmitting(false);
    }
  };

  const createLinkUsingSelectedCategoryAndSubCategoryValues = () => {
    // const feUrl = import.meta.env.VITE_FRONTEND_URI;
    let link = `category?categorySlug=${selectedCategorySlug}&subCategorySlug=${selectedSubCategorySlug}`;
    // setFormData((prev) => ({ ...prev, link: link }));
    // console.log(link);
    return link;
  };



  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {isEdit ? "Edit CatLifeBanner" : "Add New CatLifeBanner"}
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/cat-life-banner")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cat Life Banners
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label htmlFor="image-upload" className="text-base font-medium">
                Cat Life Banner Image
              </Label>

              <div className="space-y-4">
                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative">
                    <div className="aspect-video overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
                      <img
                        src={previewUrl}
                        alt="CatLifeBanner preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Upload Area */}
                {!previewUrl && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}

                {/* File Input */}
                <div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("image-upload").click()
                    }
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {previewUrl ? "Change Image" : "Select Image"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Enter banner title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-medium">
                Category
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => {
                  handleInputChange("categoryId", value);
                  setSelectedCategorySlug(value);

                  const selectedCategory = categories.find(
                    (category) => category.slug === value
                  );
                  if (selectedCategory) {
                    setSelectedCategoryId(selectedCategory._id);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) &&
                    categories.map((category) => (
                      <SelectItem key={category._id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="Sub Category" className="text-base font-medium">
                Sub Category
              </Label>
              <Select
                value={formData.subCategoryId}
                onValueChange={(value) => {
                  setSelectedSubCategoryId(value);
                  handleInputChange("subCategoryId", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sub Category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(subCategories) &&
                    subCategories.map((subCategory) => (
                      <SelectItem key={subCategory._id} value={subCategory.slug}>
                        {subCategory.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Active Status</Label>
                <p className="text-sm text-gray-500">
                  {formData.isActive
                    ? "CatLifeBanner will be visible"
                    : "CatLifeBanner will be hidden"}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1"
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {isLoading
                      ? "Loading..."
                      : isEdit
                      ? "Updating..."
                      : "Creating..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEdit ? "Update CatLifeBanner" : "Create CatLifeBanner"}
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/catLifeBanners")}
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatLifeBannerForm;
