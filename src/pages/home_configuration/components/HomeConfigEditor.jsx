import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";

import GridBuilder from "./GridBuilder";
import GridPreview from "./GridPreview";
import BannerUpload from "./BannerUpload";
import SaveConfigBox from "./SaveConfigBox";
import { useHomeConfiguration } from "../hooks/useHomeConfiguration";
import { usePageLeaveConfirmation } from "../hooks/usePageLeaveConfirmation";

const HomeConfigEditor = ({ onBack, editingConfig = null }) => {
    const {
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
    } = useHomeConfiguration(editingConfig, onBack);

    // Use page leave confirmation hook
    usePageLeaveConfirmation(hasUnsavedChanges);

    // Helper function to get display URL
    const getDisplayUrl = (imageValue) => {
        if (!imageValue) return null;
        if (typeof imageValue === 'string') return imageValue; // Already a URL
        if (imageValue instanceof File) return URL.createObjectURL(imageValue); // Create object URL for File
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center space-x-4">
                <Button 
                    onClick={onBack} 
                    variant="outline" 
                    size="icon"
                    className="rounded-full hover:cursor-pointer h-10 w-10"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h2 className="text-xl font-semibold">
                        {editingConfig ? "Edit Configuration" : "Create New Configuration"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {editingConfig ? `Editing: ${editingConfig.title || "Untitled Grid"}` : "Create a new homepage grid layout"}
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="builder">Grid Builder</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="builder" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Grid Configuration</CardTitle>
                                    <CardDescription>
                                        Configure your grid settings and layout
                                    </CardDescription>
                                </div>
                                <SaveConfigBox
                                    hasUnsavedChanges={hasUnsavedChanges()}
                                    isSaving={isSaving}
                                    onSave={handleSave}
                                    onPreview={handlePreview}
                                    variant="compact"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Basic Information */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-medium">Title (Optional)</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter grid title (optional)"
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contentType" className="text-sm font-medium">Content Type</Label>
                                        <Select value={contentType} onValueChange={handleContentTypeChange}>
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue placeholder="Select content type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="product">Product</SelectItem>
                                                <SelectItem value="category">Category</SelectItem>
                                                <SelectItem value="subCategory">Sub Category</SelectItem>
                                                <SelectItem value="collection">Collection</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Grid Dimensions */}
                                <div className="grid grid-cols-3 gap-6 items-end">
                                    <div className="space-y-2">
                                        <Label htmlFor="rows" className="text-sm font-medium">Rows</Label>
                                        <Input
                                            id="rows"
                                            type="number"
                                            min="1"
                                            max="8"
                                            value={pendingGridConfig.rows}
                                            onChange={(e) =>
                                                handleGridConfigChange({
                                                    ...pendingGridConfig,
                                                    rows: parseInt(e.target.value) || 1,
                                                })
                                            }
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="columns" className="text-sm font-medium">Columns</Label>
                                        <Input
                                            id="columns"
                                            type="number"
                                            min="1"
                                            max="8"
                                            value={pendingGridConfig.columns}
                                            onChange={(e) =>
                                                handleGridConfigChange({
                                                    ...pendingGridConfig,
                                                    columns: parseInt(e.target.value) || 1,
                                                })
                                            }
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-transparent">Action</Label>
                                        <Button
                                            onClick={handleGenerateGrid}
                                            className="bg-primary hover:bg-primary/90 w-full"
                                            size="lg"
                                            disabled={isGeneratingGrid}
                                        >
                                            {isGeneratingGrid ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Generating Grid...</span>
                                                </div>
                                            ) : (
                                                "Generate Grid"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <BannerUpload
                        bannerImage={bannerImage}
                        onBannerImageUpload={handleBannerImageUpload}
                        onBannerImageRemove={handleBannerImageRemove}
                        backgroundImage={backgroundImage}
                        onBackgroundImageUpload={handleBackgroundImageUpload}
                        onBackgroundImageRemove={handleBackgroundImageRemove}
                    />

                    <Card data-section="grid-builder">
                        <CardHeader>
                            <CardTitle>Grid Builder</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GridBuilder
                                gridConfig={gridConfig}
                                gridItems={gridItems}
                                onGridItemsUpdate={handleGridItemUpdate}
                                onLinkChange={handleLinkChange}
                                onDatabaseImageSelect={handleDatabaseImageSelect}
                                contentType={contentType}
                            />
                        </CardContent>
                    </Card>

                    <div className="mt-6 mb-6">
                        <SaveConfigBox
                            hasUnsavedChanges={hasUnsavedChanges()}
                            isSaving={isSaving}
                            onSave={handleSave}
                            onPreview={handlePreview}
                            variant="default"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-6">
                    <Card>
                        <CardContent>
                            <GridPreview 
                                gridConfig={gridConfig} 
                                gridItems={gridItems} 
                                title={title}
                                bannerImage={getDisplayUrl(bannerImage)}
                                backgroundImage={getDisplayUrl(backgroundImage)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Grid Configuration?</DialogTitle>
                        <DialogDescription>
                            You have uploaded images to the current grid. Changing the grid size will remove all uploaded images. Are you sure you want to continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseConfirmDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmGridChange}>
                            Yes, Change Grid
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Content Type Change Warning Dialog */}
            <Dialog open={showContentTypeDialog} onOpenChange={setShowContentTypeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Content Type?</DialogTitle>
                        <DialogDescription>
                            Changing the content type will delete all uploaded images. The title will be preserved. Are you sure you want to continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseContentTypeDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmContentTypeChange}>
                            Yes, Change Content Type
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HomeConfigEditor; 