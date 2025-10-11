import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const BannerUpload = ({ 
  bannerImage, 
  onBannerImageUpload, 
  onBannerImageRemove,
  bannerImageMobile,
  onBannerImageMobileUpload,
  onBannerImageMobileRemove,
  backgroundImage,
  onBackgroundImageUpload,
  onBackgroundImageRemove
}) => {
  const bannerFileInputRef = useRef(null);
  const bannerMobileFileInputRef = useRef(null);
  const backgroundFileInputRef = useRef(null);

  const handleBannerFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onBannerImageUpload(file);
    }
  };

  const handleBannerMobileFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onBannerImageMobileUpload(file);
    }
  };

  const handleBackgroundFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onBackgroundImageUpload(file);
    }
  };

  // Helper function to get display URL
  const getDisplayUrl = (imageValue) => {
    if (!imageValue) return null;
    if (typeof imageValue === 'string') return imageValue; // Already a URL
    if (imageValue instanceof File) return URL.createObjectURL(imageValue); // Create object URL for File
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner & Background (Optional)</CardTitle>
        <CardDescription>
          Upload banner and background images for your grid section
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Banner Image Upload */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Banner Image (Desktop) (Optional)</h4>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              {bannerImage ? (
                <div className="relative">
                  <img
                    src={getDisplayUrl(bannerImage)}
                    alt="Banner preview"
                    className="w-full object-cover rounded-lg"
                  />
                  <Button
                    onClick={onBannerImageRemove}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <Button
                      onClick={() => bannerFileInputRef.current?.click()}
                      variant="outline"
                      className="cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Banner Image
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Banner Image Mobile Upload */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Banner Image (Mobile) (Optional)</h4>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              {bannerImageMobile ? (
                <div className="relative">
                  <img
                    src={getDisplayUrl(bannerImageMobile)}
                    alt="Mobile Banner preview"
                    className="w-full object-cover rounded-lg"
                  />
                  <Button
                    onClick={onBannerImageMobileRemove}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <Button
                      onClick={() => bannerMobileFileInputRef.current?.click()}
                      variant="outline"
                      className="cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Mobile Banner Image
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
              <input
                ref={bannerMobileFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerMobileFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Background Image Upload */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Background Grid Image (Optional)</h4>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              {backgroundImage ? (
                <div className="relative">
                  <img
                    src={getDisplayUrl(backgroundImage)}
                    alt="Background preview"
                    className="w-full object-cover rounded-lg"
                  />
                  <Button
                    onClick={onBackgroundImageRemove}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <Button
                      onClick={() => backgroundFileInputRef.current?.click()}
                      variant="outline"
                      className="cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Background Image
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
              <input
                ref={backgroundFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BannerUpload;
