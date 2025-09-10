import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

// Upload image file to server and return URL
export const uploadImage = async (imageFile) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiService({
      endpoint: endpoints.imageUpload,
      method: "POST",
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Handle the API response structure
    if (response?.response?.success && response.response?.data) {
      return {
        success: true,
        url: response.response.data
      };
    }

    return {
      success: false,
      error: response?.response?.message || "Failed to upload image"
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error: error.message || "Network error occurred"
    };
  }
};

// Helper function to check if a value is a URL or file
export const isUrl = (value) => {
  if (typeof value === 'string') {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

// Process image - upload if file, return URL if already URL
export const processImage = async (imageValue) => {
  // If it's already a URL, return it
  if (isUrl(imageValue)) {
    return {
      success: true,
      url: imageValue
    };
  }

  // If it's a File object, upload it
  if (imageValue instanceof File) {
    return await uploadImage(imageValue);
  }

  // If it's a data URL (base64), we need to convert to file first
  if (typeof imageValue === 'string' && imageValue.startsWith('data:')) {
    try {
      const response = await fetch(imageValue);
      const blob = await response.blob();
      const file = new File([blob], 'image.png', { type: blob.type });
      return await uploadImage(file);
    } catch {
      return {
        success: false,
        error: "Failed to process image data"
      };
    }
  }

  return {
    success: false,
    error: "Invalid image format"
  };
}; 