import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useSaveHomeConfiguration } from "./useSaveHomeConfiguration";
import { processImage } from "../helpers/imageUploadApi";

export const useHomeConfiguration = (editingConfig = null, onSaveSuccess = null) => {
  // Basic configuration state
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("product");
  
  // Grid configuration state
  const [gridConfig, setGridConfig] = useState({ rows: 2, columns: 4 });
  const [pendingGridConfig, setPendingGridConfig] = useState({ rows: 2, columns: 4 });
  
  // Grid items state
  const [gridItems, setGridItems] = useState(() => {
    const totalItems = 2 * 4;
    return Array.from({ length: totalItems }, (_, index) => ({
      id: `item-${index}`,
      image: null,
      link: "",
      itemId: null,
      name: "",
      type: null,
      position: index,
    }));
  });

  // Banner and background image state (can be File or URL)
  const [bannerImage, setBannerImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("builder");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showContentTypeDialog, setShowContentTypeDialog] = useState(false);
  const [pendingContentType, setPendingContentType] = useState("product");
  const [isGeneratingGrid, setIsGeneratingGrid] = useState(false);

  // TanStack Query mutation for saving
  const saveMutation = useSaveHomeConfiguration(onSaveSuccess);
  const isSaving = saveMutation.isPending;

  // Load editing config data when provided
  useEffect(() => {
    if (editingConfig) {
      setTitle(editingConfig.title || "");
      setContentType(editingConfig.contentType || "product");
      setGridConfig(editingConfig.grid || { rows: 2, columns: 4 });
      setPendingGridConfig(editingConfig.grid || { rows: 2, columns: 4 });
      
      // For editing, banner and background are already URLs
      setBannerImage(editingConfig.bannerImage || null);
      setBackgroundImage(editingConfig.backgroundImage || null);
      
      // Transform contentItems back to gridItems format
      if (editingConfig.contentItems && editingConfig.grid) {
        const totalItems = editingConfig.grid.rows * editingConfig.grid.columns;
        const newGridItems = Array.from({ length: totalItems }, (_, index) => ({
          id: `item-${index}`,
          image: null,
          link: "",
          itemId: null,
          name: "",
          type: null,
          position: index,
        }));

        // Map contentItems to grid positions
        editingConfig.contentItems.forEach((contentItem, index) => {
          if (index < newGridItems.length) {
            newGridItems[index] = {
              ...newGridItems[index],
              image: contentItem.imageUrl,
              link: contentItem.link,
              itemId: contentItem.itemId?._id || contentItem.itemId,
              name: contentItem.itemId?.name || "",
              type: editingConfig.contentType,
            };
          }
        });

        setGridItems(newGridItems);
      }
    }
  }, [editingConfig]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    // Check if title has changed
    if (title.trim() !== "") return true;
    
    // Check if grid dimensions have changed
    if (pendingGridConfig.rows !== gridConfig.rows || 
        pendingGridConfig.columns !== gridConfig.columns) return true;
    
    // Check if any grid items have content
    if (gridItems.some(item => item.image || item.link)) return true;
    
    // Check if banner or background images are set (File or URL)
    if (bannerImage || backgroundImage) return true;
    
    return false;
  }, [title, pendingGridConfig, gridConfig, gridItems, bannerImage, backgroundImage]);

  // Grid configuration handlers
  const handleGridConfigChange = useCallback((newConfig) => {
    setPendingGridConfig(newConfig);
  }, []);

  const generateNewGrid = useCallback(() => {
    const totalItems = pendingGridConfig.rows * pendingGridConfig.columns;
    const newItems = Array.from({ length: totalItems }, (_, index) => ({
      id: `item-${index}`,
      image: null,
      link: "",
      itemId: null,
      name: "",
      type: null,
      position: index,
    }));

    setGridConfig(pendingGridConfig);
    setGridItems(newItems);
    setShowConfirmDialog(false);
  }, [pendingGridConfig]);

  const handleGenerateGrid = useCallback(async () => {
    if (pendingGridConfig.rows === gridConfig.rows &&
        pendingGridConfig.columns === gridConfig.columns) {
      toast.info("No changes detected", {
        description: "The current grid configuration is already set to the values you've entered. No action needed."
      });
      return;
    }

    const hasImages = gridItems.some(item => item.image);
    if (hasImages) {
      setShowConfirmDialog(true);
    } else {
      setIsGeneratingGrid(true);
      // Simulate processing time
      setTimeout(() => {
        generateNewGrid();
        setIsGeneratingGrid(false);
        // Scroll down to show the generated grid after delay
        setTimeout(() => {
          const gridBuilderSection = document.querySelector('[data-section="grid-builder"]');
          if (gridBuilderSection) {
            gridBuilderSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
      }, 1000);
    }
  }, [pendingGridConfig, gridConfig, gridItems, generateNewGrid]);

  const handleConfirmGridChange = useCallback(() => {
    generateNewGrid();
  }, [generateNewGrid]);

  // Content type handlers
  const handleContentTypeChange = useCallback((newContentType) => {
    if (contentType !== newContentType && gridItems.some(item => item.image)) {
      setPendingContentType(newContentType);
      setShowContentTypeDialog(true);
    } else {
      setContentType(newContentType);
    }
  }, [contentType, gridItems]);

  const handleConfirmContentTypeChange = useCallback(() => {
    setContentType(pendingContentType);
    setGridItems(Array(gridConfig.rows * gridConfig.columns).fill(null).map((_, index) => ({
      id: `item-${index}`,
      image: null,
      link: "",
      itemId: null,
      name: "",
      type: null,
      position: index,
    })));
    setShowContentTypeDialog(false);
  }, [pendingContentType, gridConfig]);

  // Grid item handlers
  const handleGridItemUpdate = useCallback((updatedItems) => {
    setGridItems(updatedItems);
  }, []);

  const handleLinkChange = useCallback((itemId, link) => {
    setGridItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, link } : item
    ));
  }, []);

  const handleDatabaseImageSelect = useCallback((itemId, selectedItem) => {
    setGridItems(prev => prev.map(item => 
      item.id === itemId ? { 
        ...item, 
        image: selectedItem.image,
        link: selectedItem.link,
        itemId: selectedItem.itemId,
        name: selectedItem.name,
        type: selectedItem.type
      } : item
    ));
  }, []);

  // Banner and background image handlers
  const handleBannerImageUpload = useCallback((file) => {
    if (file) {
      // Store the file directly - will be processed during save
      setBannerImage(file);
    }
  }, []);

  const handleBannerImageRemove = useCallback(() => {
    setBannerImage(null);
  }, []);

  const handleBackgroundImageUpload = useCallback((file) => {
    if (file) {
      // Store the file directly - will be processed during save
      setBackgroundImage(file);
    }
  }, []);

  const handleBackgroundImageRemove = useCallback(() => {
    setBackgroundImage(null);
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    // Show initial loading toast
    const loadingToast = toast.loading("Processing images and saving configuration...");
    
    try {

      // Collect all images that need processing
      const imagesToProcess = [];
      
      // Add banner image if exists
      if (bannerImage) {
        imagesToProcess.push({ type: 'banner', value: bannerImage });
      }
      
      // Add background image if exists
      if (backgroundImage) {
        imagesToProcess.push({ type: 'background', value: backgroundImage });
      }
      
      // Add grid item images
      gridItems.filter(item => item.image || item.link).forEach((item, index) => {
        if (item.image) {
          imagesToProcess.push({ type: 'gridItem', value: item.image, itemIndex: index, item });
        }
      });

      // Update loading message if there are images to upload
      if (imagesToProcess.length > 0) {
        toast.loading(`Uploading ${imagesToProcess.length} image(s)...`, { id: loadingToast });
      }

      // Process all images concurrently using Promise.all
      const imageResults = await Promise.all(
        imagesToProcess.map(async (imageData) => {
          const result = await processImage(imageData.value);
          return { ...imageData, result };
        })
      );

      // Check for any upload failures
      const failedUploads = imageResults.filter(img => !img.result.success);
      if (failedUploads.length > 0) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to upload ${failedUploads.length} image(s)`);
        return;
      }

      // Update loading message for saving
      toast.loading("Saving configuration...", { id: loadingToast });

      // Extract processed URLs
      let processedBannerImage = null;
      let processedBackgroundImage = null;
      const processedContentItems = [];

             // Process results
       imageResults.forEach(({ type, result }) => {
         if (type === 'banner') {
           processedBannerImage = result.url;
         } else if (type === 'background') {
           processedBackgroundImage = result.url;
         }
       });

      // Build content items with processed URLs
      gridItems.filter(item => item.image || item.link).forEach((item) => {
        const imageResult = imageResults.find(
          img => img.type === 'gridItem' && img.item.id === item.id
        );
        
        processedContentItems.push({
          itemId: item.itemId,
          link: item.link,
          image: imageResult ? imageResult.result.url : null,
          name: item.name,
          type: item.type
        });
      });

      // Prepare final grid data with processed URLs
      const gridData = {
        ...(editingConfig?._id && { _id: editingConfig._id }), // Include _id for updates
        title: title.trim() || null, // Make title optional
        contentType: contentType,
        grid: {
          rows: gridConfig.rows,
          columns: gridConfig.columns
        },
        contentItems: processedContentItems,
        bannerImage: processedBannerImage,
        backgroundImage: processedBackgroundImage,
        isActive: editingConfig?.isActive ?? true,
        position: editingConfig?.position ?? 0
      };

      console.log("Saving grid data:", gridData);
      
      // Use TanStack Query mutation - it handles success/error automatically
      await saveMutation.mutateAsync(gridData);
      
      // Dismiss loading toast - success toast will be shown by the mutation
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to save configuration");
      console.error("Save error:", error);
    }
  }, [title, contentType, gridConfig, gridItems, bannerImage, backgroundImage, editingConfig, saveMutation]);

  // Tab handlers
  const handlePreview = useCallback(() => {
    setActiveTab("preview");
  }, []);

  // Dialog handlers
  const handleCloseConfirmDialog = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  const handleCloseContentTypeDialog = useCallback(() => {
    setShowContentTypeDialog(false);
  }, []);

  return {
    // State
    title,
    contentType,
    gridConfig,
    pendingGridConfig,
    gridItems,
    bannerImage,
    backgroundImage,
    activeTab,
    showConfirmDialog,
    showContentTypeDialog,
    pendingContentType,
    isGeneratingGrid,
    isSaving,
    
    // Setters
    setTitle,
    setActiveTab,
    setShowConfirmDialog,
    setShowContentTypeDialog,
    
    // Handlers
    handleGridConfigChange,
    handleGenerateGrid,
    handleConfirmGridChange,
    handleContentTypeChange,
    handleConfirmContentTypeChange,
    handleGridItemUpdate,
    handleLinkChange,
    handleDatabaseImageSelect,
    handleBannerImageUpload,
    handleBannerImageRemove,
    handleBackgroundImageUpload,
    handleBackgroundImageRemove,
    handleSave,
    handlePreview,
    handleCloseConfirmDialog,
    handleCloseContentTypeDialog,
    
    // Utility functions
    hasUnsavedChanges,
  };
};
