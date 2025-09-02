import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Grid3X3,
  Eye,
  X
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { fetchAllGridConfigs, deleteGridConfig, updateGridPositions, updateGridConfig } from "../helpers/homeConfigApi";
import { toast } from "sonner";

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, config }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Configuration</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the configuration "{config?.title || "Untitled Grid"}"?
            This action cannot be undone and will permanently remove the configuration from your homepage.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            variant="destructive"
          >
            Delete Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Toggle Confirmation Dialog Component
const ToggleConfirmationDialog = ({ isOpen, onClose, onConfirm, config, isActivating }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isActivating ? "Activate Configuration" : "Deactivate Configuration"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {isActivating ? "activate" : "deactivate"} the configuration "{config?.title || "Untitled Grid"}"?
            {isActivating 
              ? " This will make it visible on the homepage." 
              : " This will hide it from the homepage."
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            variant={isActivating ? "default" : "secondary"}
          >
            {isActivating ? "Make Active" : "Make Inactive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Full Screen Preview Dialog Component
const PreviewDialog = ({ isOpen, onClose, config }) => {
  const getPreviewUrl = () => {
    // In development, assume frontend runs on port 3000
    // In production, you might want to use environment variables
    const isDev = import.meta.env.MODE === "development";
    const baseUrl = isDev ? "http://localhost:3000" : window.location.origin.replace(":5173", ":3000");
    return `${baseUrl}/preview/${config?._id}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Preview: {config?.title || "Untitled Grid"}</DialogTitle>
              <DialogDescription>
                This is how your configuration will appear on the website
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 p-6 pt-0">
          <div className="w-full h-[80vh] border rounded-lg overflow-hidden">
            <iframe
              src={getPreviewUrl()}
              className="w-full h-full"
              title={`Preview of ${config?.title || "Untitled Grid"}`}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Sortable Item Component
const SortableConfigItem = ({ config, onEdit, onDelete, onToggleActive, onPreview }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case "product": return "bg-blue-100 text-blue-800";
      case "category": return "bg-green-100 text-green-800";
      case "subCategory": return "bg-purple-100 text-purple-800";
      case "collection": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 ${isDragging ? 'shadow-lg' : 'shadow-sm'} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Config Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-medium text-gray-900">
                {config.title || "Untitled Grid"}
              </h3>
              <Badge className={getContentTypeColor(config.contentType)}>
                {config.contentType}
              </Badge>
              <Badge variant={config.isActive ? "default" : "secondary"}>
                {config.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Grid3X3 className="h-4 w-4 mr-1" />
                {config.grid.rows} × {config.grid.columns}
              </span>
              <span>{config.contentItems?.length || 0} items</span>
              <span>Position: {config.position}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* View Button */}
          <Button
            onClick={() => onPreview(config)}
            variant="outline"
            size="sm"
            title="View configuration"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {/* Active/Inactive Switch */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {config.isActive ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={config.isActive}
              onCheckedChange={() => onToggleActive(config)}
              aria-label={`Toggle ${config.isActive ? 'inactive' : 'active'}`}
            />
          </div>
          
          <Button
            onClick={() => onEdit(config)}
            variant="outline"
            size="sm"
            title="Edit configuration"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(config)}
            variant="destructive"
            size="sm"
            title="Delete configuration"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const HomeConfigList = ({ onEdit, onAdd }) => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleDialog, setToggleDialog] = useState({
    isOpen: false,
    config: null,
    isActivating: false
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    config: null
  });
  const [previewDialog, setPreviewDialog] = useState({
    isOpen: false,
    config: null
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch configurations on mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetchAllGridConfigs();
      if (response.success && response.data) {
        // Sort by position
        const sortedConfigs = response.data.sort((a, b) => a.position - b.position);
        setConfigs(sortedConfigs);
      }
    } catch (error) {
      toast.error("Failed to load configurations");
      console.error("Error loading configurations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = configs.findIndex((config) => config._id === active.id);
      const newIndex = configs.findIndex((config) => config._id === over.id);

      const newConfigs = arrayMove(configs, oldIndex, newIndex);
      
      // Update local state immediately
      setConfigs(newConfigs);

      try {
        // Update positions on server
        await updateGridPositions(newConfigs);
        toast.success("Configuration order updated");
      } catch {
        // Revert on error
        setConfigs(configs);
        toast.error("Failed to update order");
      }
    }
  };

  const handleDelete = (config) => {
    setDeleteDialog({
      isOpen: true,
      config
    });
  };

  const confirmDelete = async () => {
    const { config } = deleteDialog;
    try {
      await deleteGridConfig(config._id);
      setConfigs(prev => prev.filter(c => c._id !== config._id));
      toast.success("Configuration deleted successfully");
    } catch {
      toast.error("Failed to delete configuration");
    } finally {
      setDeleteDialog({ isOpen: false, config: null });
    }
  };

  const handleToggleActive = (config) => {
    setToggleDialog({
      isOpen: true,
      config,
      isActivating: !config.isActive
    });
  };

  const confirmToggleActive = async () => {
    const { config } = toggleDialog;
    try {
      const updatedConfig = { ...config, isActive: !config.isActive };
      await updateGridConfig(config._id, updatedConfig);
      setConfigs(prev => prev.map(c => 
        c._id === config._id ? { ...c, isActive: !c.isActive } : c
      ));
      toast.success(`Configuration made ${updatedConfig.isActive ? 'active' : 'inactive'}`);
    } catch {
      toast.error("Failed to update configuration status");
    } finally {
      setToggleDialog({ isOpen: false, config: null, isActivating: false });
    }
  };

  const handlePreview = (config) => {
    setPreviewDialog({
      isOpen: true,
      config
    });
  };

  const closeToggleDialog = () => {
    setToggleDialog({ isOpen: false, config: null, isActivating: false });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, config: null });
  };

  const closePreviewDialog = () => {
    setPreviewDialog({ isOpen: false, config: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Home Grid Configurations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and reorder your homepage grid layouts
              </p>
            </div>
            <Button onClick={onAdd} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add New Configuration</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-12">
              <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No configurations found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first grid configuration</p>
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Configuration
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={configs.map(c => c._id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {configs.map((config) => (
                    <SortableConfigItem
                      key={config._id}
                      config={config}
                      onEdit={onEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      onPreview={handlePreview}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Toggle Confirmation Dialog */}
      <ToggleConfirmationDialog
        isOpen={toggleDialog.isOpen}
        onClose={closeToggleDialog}
        onConfirm={confirmToggleActive}
        config={toggleDialog.config}
        isActivating={toggleDialog.isActivating}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        config={deleteDialog.config}
      />

      {/* Preview Dialog */}
      <PreviewDialog
        isOpen={previewDialog.isOpen}
        onClose={closePreviewDialog}
        config={previewDialog.config}
      />
    </>
  );
};

export default HomeConfigList;
