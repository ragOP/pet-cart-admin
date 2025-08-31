import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useSaveHomeConfiguration } from "./useSaveHomeConfiguration";

export const useHomeConfiguration = () => {
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

  // UI state
  const [activeTab, setActiveTab] = useState("builder");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showContentTypeDialog, setShowContentTypeDialog] = useState(false);
  const [pendingContentType, setPendingContentType] = useState("product");
  const [isGeneratingGrid, setIsGeneratingGrid] = useState(false);

  // TanStack Query mutation for saving
  const saveMutation = useSaveHomeConfiguration();
  const isSaving = saveMutation.isPending;

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    // Check if title has changed
    if (title.trim() !== "") return true;
    
    // Check if grid dimensions have changed
    if (pendingGridConfig.rows !== gridConfig.rows || 
        pendingGridConfig.columns !== gridConfig.columns) return true;
    
    // Check if any grid items have content
    if (gridItems.some(item => item.image || item.link)) return true;
    
    return false;
  }, [title, pendingGridConfig, gridConfig, gridItems]);

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

  // Save handler
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const gridData = {
      title: title.trim(),
      contentType: contentType,
      grid: {
        rows: gridConfig.rows,
        columns: gridConfig.columns
      },
      contentItems: gridItems.filter(item => item.image || item.link).map(item => ({
        itemId: item.itemId,
        link: item.link,
        image: item.image,
        name: item.name,
        type: item.type
      })),
      isActive: true,
      position: 0
    };

    // Use TanStack Query mutation - it handles success/error automatically
    await saveMutation.mutateAsync(gridData);
  }, [title, contentType, gridConfig, gridItems, saveMutation]);

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
      handleSave,
      handlePreview,
      handleCloseConfirmDialog,
      handleCloseContentTypeDialog,
      
      // Utility functions
      hasUnsavedChanges,
    };
}; 