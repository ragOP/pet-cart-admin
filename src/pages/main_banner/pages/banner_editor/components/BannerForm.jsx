import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Upload, Image as ImageIcon, Save, X } from "lucide-react";
import { updateBanner } from "../../../helpers/updateBanner";
import { createBanner } from "../../../helpers/createBanner";
import { urlToFile } from "@/utils/file/urlToFile";
import { validateImageDimensions } from '@/utils/validate_image_dimensions';

const BannerForm = ({ initialData, isEdit, isLoading = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    type: 'web',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData && isEdit) {
      console.log('Initial data for editing:', initialData);
      setFormData({
        type: initialData.type || 'web',
      });
      
      // Convert existing image URL to file object if image exists
      if (initialData.image) {
        setPreviewUrl(initialData.image);
        const convertImage = async () => {
          try {
            const file = await urlToFile(initialData.image, 'banner_image.jpg');
            if (file) {
              setSelectedFile(file);
            }
          } catch (error) {
            console.error('Error converting image URL to file:', error);
          }
        };
        convertImage();
      }
    }
  }, [initialData, isEdit]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
        'horizontal'
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
    setPreviewUrl('');
    // Reset file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const updateBannerMutation = useMutation({
    mutationFn: updateBanner,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Banner updated successfully');
        queryClient.invalidateQueries(['banners']);
        navigate('/dashboard/banners');
      } else {
        toast.error(result.message || 'Failed to update banner');
      }
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('An error occurred while updating the banner');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const createBannerMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Banner created successfully');
        queryClient.invalidateQueries(['banners']);
        navigate('/dashboard/banners');
      } else {
        toast.error(result.message || 'Failed to create banner');
      }
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast.error('An error occurred while creating the banner');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    // if (!formData.link.trim()) {
    //   toast.error('Please enter a link');
    //   return;
    // }

    if (!isEdit && !selectedFile) {
      toast.error('Please select an image');
      return;
    }

    // Additional validation for edit mode
    if (isEdit && !initialData?._id) {
      toast.error('Banner data not loaded. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      
      // Add form fields
      // submitFormData.append('link', formData.link);
      submitFormData.append('type', formData.type);
      // submitFormData.append('isActive', formData.isActive.toString());
      
      // Add image if selected
      if (selectedFile) {
        submitFormData.append('images', selectedFile);
      }

      if (isEdit) {
        updateBannerMutation.mutate({
          id: initialData._id,
          formData: submitFormData
        });
      } else {
        createBannerMutation.mutate({
          formData: submitFormData
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred while submitting the form');
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
              {isEdit ? 'Edit Banner' : 'Add New Banner'}
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/banners')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Banners
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label htmlFor="image-upload" className="text-base font-medium">
                Banner Image
              </Label>
              
              <div className="space-y-4">
                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative">
                    <div className="aspect-video overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
                      <img
                        src={previewUrl}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
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
                    onClick={() => document.getElementById('image-upload').click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {previewUrl ? 'Change Image' : 'Select Image'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-base font-medium">
                Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web</SelectItem>
                  {/* <SelectItem value="mobile">Mobile</SelectItem> */}
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
                    {isLoading ? 'Loading...' : (isEdit ? 'Updating...' : 'Creating...')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEdit ? 'Update Banner' : 'Create Banner'}
                  </div>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/banners')}
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

export default BannerForm; 