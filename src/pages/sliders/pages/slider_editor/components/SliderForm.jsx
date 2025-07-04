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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Upload, Image as ImageIcon, Save, X } from "lucide-react";
import { updateSlider } from "../../../helpers/updateSlider";
import { createSlider } from "../../../helpers/createSlider";
import { urlToFile } from "@/utils/file/urlToFile";
import { validateImageDimensions } from "@/utils/validate_image_dimensions";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories";
import { fetchSubCategoriesByCategoryId } from "@/pages/sub_category/helpers/fetchSubCategories";

const SliderForm = ({ initialData, isEdit, isLoading = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    type: "web",
    link: "",
    isActive: false,
  });
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
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

  const categories = categoryListRes?.data?.categories || [];
  const subCategories = subCategoryListRes?.data || [];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData && isEdit) {
      console.log("Initial data for editing:", initialData);
      setFormData({
        type: initialData.type || "web",
        link: initialData.link || "",
        isActive: initialData.isActive || false,
      });

      // Convert existing image URL to file object if image exists
      if (initialData.image) {
        setPreviewUrl(initialData.image);
        const convertImage = async () => {
          try {
            const file = await urlToFile(initialData.image, "slider_image.jpg");
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

      const { valid, error } = await validateImageDimensions(
        file,
        formData.type,
        "short-horizontal"
      );
      if (!valid) {
        toast.error(error);
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

  const updateSliderMutation = useMutation({
    mutationFn: updateSlider,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Slider updated successfully");
        queryClient.invalidateQueries(["sliders"]);
        navigate("/dashboard/sliders");
      } else {
        toast.error(result.message || "Failed to update slider");
      }
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("An error occurred while updating the slider");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const createSliderMutation = useMutation({
    mutationFn: createSlider,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Slider created successfully");
        queryClient.invalidateQueries(["sliders"]);
        navigate("/dashboard/sliders");
      } else {
        toast.error(result.message || "Failed to create slider");
      }
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("An error occurred while creating the slider");
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
      toast.error("Slider data not loaded. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const link = createLinkUsingSelectedCategoryAndSubCategoryValues();
      const submitFormData = new FormData();

      // Add form fields
      submitFormData.append("type", formData.type);
      submitFormData.append("isActive", formData.isActive);

      // console.log(formData.link);
      submitFormData.append("link", link);

      // Add image if selected
      if (selectedFile) {
        submitFormData.append("images", selectedFile);
      }

      if (isEdit) {
        updateSliderMutation.mutate({
          id: initialData._id,
          formData: submitFormData,
        });
      } else {
        createSliderMutation.mutate({
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
    let link = `category?categorySlug=${selectedCategorySlug}&subCategorySlug=${selectedSubCategorySlug}`;
    return link;
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "web":
        return "bg-blue-100 text-blue-700";
      case "mobile":
        return "bg-green-100 text-green-700";
      case "app":
        return "bg-purple-100 text-purple-700";
      case "tablet":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };


  console.log(selectedCategoryId);
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {isEdit ? "Edit Slider" : "Add New Slider"}
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/sliders")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sliders
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label htmlFor="image-upload" className="text-base font-medium">
                Slider Image
              </Label>

              <div className="space-y-4">
                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative">
                    <div className="aspect-video overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
                      <img
                        src={previewUrl}
                        alt="Slider preview"
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

            {/* Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-base font-medium">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Badge className={getTypeBadgeColor(formData.type)}>
                  {formData.type}
                </Badge>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-medium">
                Category
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => {
                  console.log(value);
                  setSelectedCategorySlug(value);
                  handleInputChange("categoryId", value);

                  const selectedCategory = categories.find(
                    (category) => category.slug === value
                  );
                  setSelectedCategoryId(selectedCategory._id);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) &&
                    categories.map((category) => (
                      <SelectItem
                        key={category._id}
                        value={category.slug}
                      >
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
                  setSelectedSubCategorySlug(value);
                  handleInputChange("subCategoryId", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sub Category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(subCategories) &&
                    subCategories.map((subCategory) => (
                      <SelectItem
                        key={subCategory._id}
                        value={subCategory.slug}
                      >
                        {subCategory.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Link Input */}
            {/* <div className="space-y-2">
              <Label htmlFor="link" className="text-base font-medium">
                Link URL
              </Label>
              <Input
                id="link"
                type="url"
                placeholder="https://example.com"
                value={formData.link}
                onChange={(e) => handleInputChange("link", e.target.value)}
                disabled
              />
            </div> */}

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Active Status</Label>
                <p className="text-sm text-gray-500">
                  {formData.isActive
                    ? "Slider will be visible"
                    : "Slider will be hidden"}
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
                    {isEdit ? "Update Slider" : "Create Slider"}
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/sliders")}
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

export default SliderForm;
