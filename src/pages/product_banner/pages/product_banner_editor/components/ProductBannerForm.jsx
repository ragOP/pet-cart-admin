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
import { updateProductBanner } from "../../../helpers/updateProductBanner";
import { createProductBanner } from "../../../helpers/createProductBanner";
import { urlToFile } from "@/utils/file/urlToFile";
import { validateImageDimensions } from "@/utils/validate_image_dimensions";
import { fetchProducts } from "@/pages/product/helpers/fetchProducts";

const ProductBannerForm = ({ initialData, isEdit, isLoading = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    type: initialData?.type || "web",
    isActive: initialData?.isActive || false,
    productId: initialData?.productId?._id || "",
    image: initialData?.image || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { data: productsRes } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const products = productsRes?.data || [];
  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        type: initialData.type || "web",
        productId: initialData.productId?._id || "",
        isActive: initialData.isActive || false,
        image: initialData.image || "",
      });

      // Convert existing image URL to file object if image exists
      if (initialData.image) {
        setPreviewUrl(initialData.image);
        const convertImage = async () => {
          try {
            const file = await urlToFile(initialData.image, "product_banner_image.jpg");
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

      // const { valid, error } = await validateImageDimensions(
      //   file,
      //   formData.type,
      //   "short-horizontal"
      // );
      // if (!valid) {
      //   toast.error(error);
      //   return;
      // }

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

  const updateProductBannerMutation = useMutation({
    mutationFn: updateProductBanner,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Product Banner updated successfully");
        queryClient.invalidateQueries(["product-banner"]);
        navigate("/dashboard/product-banner");
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

  const createProductBannerMutation = useMutation({
    mutationFn: createProductBanner,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Product Banner created successfully");
        queryClient.invalidateQueries(["product-banner"]);
        navigate("/dashboard/product-banner");
      } else {
        toast.error(result.message || "Failed to create product banner");
      }
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("An error occurred while creating the product banner");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleFormError = (field, message) => {
    setError(message);
    setFormData((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productId) {
      handleFormError("productId", "Please select a product");
      return;
    }

    if (!selectedFile) {
      handleFormError("image", "Please select an image");
      return;
    }

    if (!formData.type) {
      handleFormError("type", "Please select a type");
      return;
    }
    
    // Returning toast error for error fields
    if(error){
      toast.error(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();

      // Add form fields
      submitFormData.append("type", formData.type);
      submitFormData.append("isActive", formData.isActive);
      submitFormData.append("productId", formData.productId);

      // Add image if selected
      if (selectedFile) {
        submitFormData.append("image", selectedFile);
      }

      if (isEdit) {
        updateProductBannerMutation.mutate({
          id: initialData._id,
          formData: submitFormData,
        });
      } else {
        createProductBannerMutation.mutate({
          formData: submitFormData,
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred while submitting the form");
      setIsSubmitting(false);
    }
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

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {isEdit ? "Edit Product Banner" : "Add New Product Banner"}
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/product-banner")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Product Banner
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label htmlFor="image-upload" className="text-base font-medium">
                Product Banner Image
              </Label>

              <div className="space-y-4">
                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative">
                    <div className="aspect-video overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
                      <img
                        src={previewUrl}
                        alt="Product Banner preview"
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

            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product" className="text-base font-medium">
                Product
              </Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => {
                  handleInputChange("productId", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(products) &&
                    products.map((product) => (
                      <SelectItem
                        key={product._id}
                        value={product._id}
                      >
                        {product.title}
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
                    ? "Product Banner will be visible"
                    : "Product Banner will be hidden"}
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
                    {isEdit ? "Update Product Banner" : "Create Product Banner"}
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/product-banner")}
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

export default ProductBannerForm;
