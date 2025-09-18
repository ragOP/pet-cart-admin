import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useSaveHomeConfiguration } from "./useSaveHomeConfiguration";
import { processImage } from "../helpers/imageUploadApi";

export const useGridConfiguration = (
  editingConfig = null,
  onSaveSuccess = null,
  selectedSection = "home"
) => {
  // Basic configuration state
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("product");
  const [isTitleShow, setIsTitleShow] = useState(true);

  console.log(">>", selectedSection)

  // Grid configuration state - now includes mobile dimensions
  const [gridConfig, setGridConfig] = useState({
    rows: 2,
    columns: 4,
    mobileRows: 2,
    mobileColumns: 2,
  });
  const [pendingGridConfig, setPendingGridConfig] = useState({
    rows: 2,
    columns: 4,
    mobileRows: 2,
    mobileColumns: 2,
  });

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
      setIsTitleShow(
        typeof editingConfig.isTitleShow === "boolean" ? editingConfig.isTitleShow : true
      );

      // Handle backward compatibility for grid config
      const gridData = editingConfig.grid || {
        rows: 2,
        columns: 4,
        mobileRows: 4,
        mobileColumns: 2,
      };
      const fullGridConfig = {
        rows: gridData.rows || 2,
        columns: gridData.columns || 4,
        mobileRows: gridData.mobileRows || 4,
        mobileColumns: gridData.mobileColumns || 2,
      };

      setGridConfig(fullGridConfig);
      setPendingGridConfig(fullGridConfig);

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
    // Check if title show flag is toggled when editing existing config
    if (editingConfig && typeof editingConfig.isTitleShow === "boolean" && editingConfig.isTitleShow !== isTitleShow) return true;

    // Check if grid dimensions have changed (including mobile)
    if (
      pendingGridConfig.rows !== gridConfig.rows ||
      pendingGridConfig.columns !== gridConfig.columns ||
      pendingGridConfig.mobileRows !== gridConfig.mobileRows ||
      pendingGridConfig.mobileColumns !== gridConfig.mobileColumns
    )
      return true;

    // Check if any grid items have content
    if (gridItems.some((item) => item.image || item.link)) return true;

    // Check if banner or background images are set (File or URL)
    if (bannerImage || backgroundImage) return true;

    return false;
  }, [
    title,
    isTitleShow,
    pendingGridConfig,
    gridConfig,
    gridItems,
    bannerImage,
    backgroundImage,
    editingConfig,
  ]);

  // Add validation function
  const validateGridConfiguration = useCallback((config) => {
    const desktopTotal = config.rows * config.columns;
    const mobileTotal = config.mobileRows * config.mobileColumns;
    return {
      isValid: desktopTotal === mobileTotal,
      desktopTotal,
      mobileTotal,
      message: desktopTotal === mobileTotal 
        ? null 
        : `Desktop (${config.rows} × ${config.columns} = ${desktopTotal}) and mobile (${config.mobileRows} × ${config.mobileColumns} = ${mobileTotal}) grids must have equal total items`
    };
  }, []);

  // Grid configuration handlers
  const handleGridConfigChange = useCallback((newConfig) => {
    setPendingGridConfig(newConfig);
    
    // Show validation message in real-time
    const validation = validateGridConfiguration(newConfig);
    if (!validation.isValid) {
      toast.error("Grid validation", {
        description: validation.message,
        duration: 3000,
      });
    }
  }, [validateGridConfiguration]);

  const generateNewGrid = useCallback(() => {
    const currentTotalItems = gridConfig.rows * gridConfig.columns;
    const newTotalItems = pendingGridConfig.rows * pendingGridConfig.columns;
    
    let newItems;
    
    if (newTotalItems >= currentTotalItems) {
      // If new grid is larger or same size, preserve existing items and add new empty ones
      newItems = [...gridItems];
      
      // Add new empty items if needed
      for (let i = currentTotalItems; i < newTotalItems; i++) {
        newItems.push({
          id: `item-${i}`,
          image: null,
          link: "",
          itemId: null,
          name: "",
          type: null,
          position: i,
        });
      }
    } else {
      // If new grid is smaller, keep only the first N items and remove the rest
      newItems = gridItems.slice(0, newTotalItems);
      
      // Update positions for remaining items
      newItems = newItems.map((item, index) => ({
        ...item,
        position: index,
      }));
    }

    setGridConfig(pendingGridConfig);
    setGridItems(newItems);
    setShowConfirmDialog(false);
  }, [pendingGridConfig, gridConfig, gridItems]);

  const handleGenerateGrid = useCallback(async () => {
    if (
      pendingGridConfig.rows === gridConfig.rows &&
      pendingGridConfig.columns === gridConfig.columns &&
      pendingGridConfig.mobileRows === gridConfig.mobileRows &&
      pendingGridConfig.mobileColumns === gridConfig.mobileColumns
    ) {
      toast.info("No changes detected", {
        description:
          "The current grid configuration is already set to the values you've entered. No action needed.",
      });
      return;
    }

    // Validate that desktop and mobile grids have the same total number of items
    const desktopTotal = pendingGridConfig.rows * pendingGridConfig.columns;
    const mobileTotal = pendingGridConfig.mobileRows * pendingGridConfig.mobileColumns;
    
    if (desktopTotal !== mobileTotal) {
      toast.error("Grid validation failed", {
        description: `Desktop grid (${pendingGridConfig.rows} × ${pendingGridConfig.columns} = ${desktopTotal} items) and mobile grid (${pendingGridConfig.mobileRows} × ${pendingGridConfig.mobileColumns} = ${mobileTotal} items) must have the same total number of items.`,
      });
      return;
    }

    const hasImages = gridItems.some((item) => item.image);
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
          const gridBuilderSection = document.querySelector(
            '[data-section="grid-builder"]'
          );
          if (gridBuilderSection) {
            gridBuilderSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
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
  const handleContentTypeChange = useCallback(
    (newContentType) => {
      if (
        contentType !== newContentType &&
        gridItems.some((item) => item.image)
      ) {
        setPendingContentType(newContentType);
        setShowContentTypeDialog(true);
      } else {
        setContentType(newContentType);
      }
    },
    [contentType, gridItems]
  );

  const handleConfirmContentTypeChange = useCallback(() => {
    setContentType(pendingContentType);
    setGridItems(
      Array(gridConfig.rows * gridConfig.columns)
        .fill(null)
        .map((_, index) => ({
          id: `item-${index}`,
          image: null,
          link: "",
          itemId: null,
          name: "",
          type: null,
          position: index,
        }))
    );
    setShowContentTypeDialog(false);
  }, [pendingContentType, gridConfig]);

  // Grid item handlers
  const handleGridItemUpdate = useCallback((updatedItems) => {
    setGridItems(updatedItems);
  }, []);

  const handleLinkChange = useCallback((itemId, link) => {
    setGridItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, link } : item))
    );
  }, []);

  const handleDatabaseImageSelect = useCallback((itemId, selectedItem) => {
    setGridItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              image: selectedItem.image,
              link: selectedItem.link,
              itemId: selectedItem.itemId,
              name: selectedItem.name,
              type: selectedItem.type,
            }
          : item
      )
    );
  }, []);

  // Banner and background image handlers
  const handleBannerImageUpload = useCallback((file) => {
    if (file) {
      setBannerImage(file);
    }
  }, []);

  const handleBannerImageRemove = useCallback(() => {
    setBannerImage(null);
  }, []);

  const handleBackgroundImageUpload = useCallback((file) => {
    if (file) {
      setBackgroundImage(file);
    }
  }, []);

  const handleBackgroundImageRemove = useCallback(() => {
    setBackgroundImage(null);
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    const loadingToast = toast.loading(
      "Processing images and saving configuration..."
    );

    try {
      const imagesToProcess = [];

      if (bannerImage) {
        imagesToProcess.push({ type: "banner", value: bannerImage });
      }

      if (backgroundImage) {
        imagesToProcess.push({ type: "background", value: backgroundImage });
      }

      gridItems
        .filter((item) => item.image || item.link)
        .forEach((item, index) => {
          if (item.image) {
            imagesToProcess.push({
              type: "gridItem",
              value: item.image,
              itemIndex: index,
              item,
            });
          }
        });

      if (imagesToProcess.length > 0) {
        toast.loading(`Uploading ${imagesToProcess.length} image(s)...`, {
          id: loadingToast,
        });
      }

      const imageResults = await Promise.all(
        imagesToProcess.map(async (imageData) => {
          const result = await processImage(imageData.value);
          return { ...imageData, result };
        })
      );

      const failedUploads = imageResults.filter((img) => !img.result.success);
      if (failedUploads.length > 0) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to upload ${failedUploads.length} image(s)`);
        return;
      }

      toast.loading("Saving configuration...", { id: loadingToast });

      let processedBannerImage = null;
      let processedBackgroundImage = null;
      const processedContentItems = [];

      imageResults.forEach(({ type, result }) => {
        if (type === "banner") {
          processedBannerImage = result.url;
        } else if (type === "background") {
          processedBackgroundImage = result.url;
        }
      });

      gridItems
        .filter((item) => item.image || item.link)
        .forEach((item) => {
          const imageResult = imageResults.find(
            (img) => img.type === "gridItem" && img.item.id === item.id
          );

          processedContentItems.push({
            itemId: item.itemId,
            link: item.link,
            image: imageResult ? imageResult.result.url : null,
            name: item.name,
            type: item.type,
          });
        });

        console.log("SELECTED SECTION", selectedSection)
      // Prepare final grid data with mobile configuration and keyword
      const gridData = {
        ...(editingConfig?._id && { _id: editingConfig._id }),
        title: title.trim() || null,
        contentType: contentType,
        keyword: selectedSection,
        isTitleShow,
        grid: {
          rows: gridConfig.rows,
          columns: gridConfig.columns,
          mobileRows: gridConfig.mobileRows,
          mobileColumns: gridConfig.mobileColumns,
        },
        contentItems: processedContentItems,
        bannerImage: processedBannerImage,
        backgroundImage: processedBackgroundImage,
        isActive: editingConfig?.isActive ?? true,
        position: editingConfig?.position ?? 0,
      };

      console.log("Saving grid data:", gridData);

      await saveMutation.mutateAsync(gridData);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to save configuration");
      console.error("Save error:", error);
    }
  }, [
    title,
    contentType,
    gridConfig,
    gridItems,
    bannerImage,
    backgroundImage,
    editingConfig,
    saveMutation,
    selectedSection,
    isTitleShow,

  ]);

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
    isTitleShow,
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
    setIsTitleShow,
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
