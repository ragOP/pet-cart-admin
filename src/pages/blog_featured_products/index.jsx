import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import MultiSelectProducts from "../blog/pages/blog_editor/components/MultiSelectProducts";
import { Upload, Image as ImageIcon, X, Save } from "lucide-react";
import { toast } from "sonner";
// import { validateImageDimensions } from "@/utils/validate_image_dimensions";
import { urlToFile } from "@/utils/file/urlToFile";
import { fetchProducts } from "../product/helpers/fetchProducts";
import { apiService } from "@/api/api_services";

const FEATURED_API = "api/featured-blog-products";

const BlogFeaturedProducts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    bannerImage: "",
    productIds: [],
    _id: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Fetch all products for dropdown
  useEffect(() => {
    fetchProducts({})
      .then((data) => {
        let arr = [];
        if (Array.isArray(data?.data)) {
          arr = data.data;
        } else if (Array.isArray(data)) {
          arr = data;
        }
        setProducts(arr);
      })
      .catch(() => setProducts([]));
  }, []);

  // Fetch current featured blog products
  useEffect(() => {
    setIsLoading(true);
    apiService({
      endpoint: `${FEATURED_API}/get-featured-products`,
      method: "GET",
    })
      .then((res) => {
        const data = res?.response?.data;
        if (data) {
          setFormData({
            bannerImage: data.bannerImage || "",
            productIds: (data.productIds || []).map((p) => p._id),
            _id: data._id,
          });
          setPreviewUrl(data.bannerImage || "");
          if (data.bannerImage) {
            urlToFile(data.bannerImage, "featured_banner.jpg").then(
              setSelectedFile
            );
          }
        }
      })
      .catch(() => toast.error("Failed to fetch featured blog products."))
      .finally(() => setIsLoading(false));
  }, []);

  // Handle image file change
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, bannerImage: "" }));
  };

  // Handle product selection
  const handleProductsChange = (ids) => {
    setFormData((prev) => ({ ...prev, productIds: ids }));
  };

  // Handle save/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !previewUrl) {
      toast.error("Please select a banner image.");
      return;
    }
    if (formData.productIds.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }
    setIsSaving(true);
    try {
      // Prepare form data
      const uploadData = new FormData();
      uploadData.append("productIds", formData.productIds);
      if (selectedFile) uploadData.append("bannerImage", selectedFile);
      // If editing, include _id
      if (formData._id) uploadData.append("_id", formData._id);
      const method = formData._id ? "PUT" : "POST";
      const endpoint = formData._id
        ? `${FEATURED_API}/update-featured-product/${formData._id}`
        : `${FEATURED_API}/add-featured-products`;
      const res = await apiService({
        endpoint,
        method,
        data: uploadData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.response?.success) {
        toast.success("Featured blog products updated successfully!");
      } else {
        toast.error(
          res?.response?.message || "Failed to update featured blog products."
        );
      }
    } catch {
      toast.error("Failed to update featured blog products.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <CustomSpinner />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-4 md:px-8 mt-8">
      <h1 className="text-2xl font-bold">Blog Featured Products</h1>
      <p className="text-sm text-gray-500 mb-6">
        This is the featured products for the blog.
      </p>
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="image-upload" className="text-base font-medium">
                Banner Image
              </Label>
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative">
                    <div className="aspect-video overflow-hidden h-40 rounded-lg border-2 border-dashed border-gray-300">
                      <img
                        src={previewUrl}
                        alt="Banner preview"
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
            {/* Product Multi-Select */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Select Products</Label>
              <div className="w-full">
                <MultiSelectProducts
                  products={products}
                  value={formData.productIds}
                  onChange={handleProductsChange}
                />
              </div>
            </div>
            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogFeaturedProducts;
