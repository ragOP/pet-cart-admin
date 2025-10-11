import React, { useState } from "react";
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
import { useGridConfiguration } from "../hooks/useGridConfiguration";
import { usePageLeaveConfirmation } from "../hooks/usePageLeaveConfirmation";
import { Switch } from "@/components/ui/switch";

const GridConfigEditor = ({ onBack, editingConfig = null, selectedSection = "home" }) => {

    console.log("selectedSection >>>")
    const {
        // State
        title,
        contentType,
        isTitleShow,
        gridConfig,
        pendingGridConfig,
        gridItems,
        bannerImage,
        bannerImageMobile,
        backgroundImage,
        activeTab,
        showConfirmDialog,
        showContentTypeDialog,
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
        handleBannerImageMobileUpload,
        handleBannerImageMobileRemove,
        handleBackgroundImageUpload,
        handleBackgroundImageRemove,
        handleSave,
        handlePreview,
        handleCloseConfirmDialog,
        handleCloseContentTypeDialog,

        // Utility functions
        hasUnsavedChanges,
    } = useGridConfiguration(editingConfig, onBack, selectedSection);

    // Add validation state and function
    const [validationError, setValidationError] = useState(null);

    const validateGridConfiguration = (config) => {
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
    };

    // Update the handleGridConfigChange to include validation
    const handleGridConfigChangeWithValidation = (newConfig) => {
        handleGridConfigChange(newConfig);

        const validation = validateGridConfiguration(newConfig);
        setValidationError(validation.isValid ? null : validation.message);
    };

    // Use page leave confirmation hook
    usePageLeaveConfirmation(hasUnsavedChanges);

    // Helper function to get display URL
    const getDisplayUrl = (imageValue) => {
        if (!imageValue) return null;
        if (typeof imageValue === 'string') return imageValue; // Already a URL
        if (imageValue instanceof File) return URL.createObjectURL(imageValue); // Create object URL for File
        return null;
    };

    // Get section display info
    const getSectionInfo = (section) => {
        switch (section) {
            case "home": return { title: "Home", icon: "🏠", color: "text-blue-600", keyword: "home" };
            case "category": return { title: "Category", icon: "🏷️", color: "text-green-600", keyword: "category" };
            case "cart": return { title: "Cart", icon: "🛒", color: "text-orange-600", keyword: "cart" };
            default: return { title: "Home", icon: "🏠", color: "text-blue-600", keyword: "home" };
        }
    };

    const sectionInfo = getSectionInfo(selectedSection);

    return (
        <div className="mx-auto">
            {/* Header with Back Button */}

            {/* Title Section */}
            <div className="mb-6 flex flex-row items-center gap-4">
                <div
                    onClick={onBack}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer p-2 rounded-md transition-colors"
                >                    <ChevronLeft className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{sectionInfo.icon}</span>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {editingConfig ? `Edit ${sectionInfo.title} Configuration` : `Create New ${sectionInfo.title} Configuration`}
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        {editingConfig
                            ? `Update your existing ${sectionInfo.title.toLowerCase()} grid layout and content`
                            : `Design a custom grid layout for your ${sectionInfo.title.toLowerCase()} page`
                        }
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
                                    <CardTitle className="text-lg">Grid Configuration</CardTitle>
                                    <CardDescription className="text-sm">
                                        Configure your grid settings and layout for desktop and mobile
                                        <span className={`ml-2 font-medium ${sectionInfo.color}`}>
                                            ({sectionInfo.title} Section)
                                        </span>
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
                                            placeholder={`Enter ${sectionInfo.title.toLowerCase()} grid title (optional)`}
                                            className="h-10"
                                        />
                                        <Label htmlFor="isTitleShow" className="text-sm font-medium">Show Title On Web/Mobile</Label>
                                        <Switch id="isTitleShow" checked={isTitleShow} onCheckedChange={setIsTitleShow} />
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
                                                <SelectItem value="brand">Brand</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Desktop Grid Dimensions */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-900">Desktop Grid Dimensions</Label>
                                    {validationError && (
                                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
                                            {validationError}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-5 gap-6 items-end">
                                        <div className="space-y-2">
                                            <Label htmlFor="rows" className="text-sm font-medium">Rows</Label>
                                            <Input
                                                id="rows"
                                                type="number"
                                                min="1"
                                                max="8"
                                                value={pendingGridConfig.rows}
                                                onChange={(e) =>
                                                    handleGridConfigChangeWithValidation({
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
                                                    handleGridConfigChangeWithValidation({
                                                        ...pendingGridConfig,
                                                        columns: parseInt(e.target.value) || 1,
                                                    })
                                                }
                                                className="h-10"
                                            />
                                        </div>

                                        {/* Mobile Grid Dimensions */}
                                        <div className="space-y-2">
                                            <Label htmlFor="mobileRows" className="text-sm font-medium">Mobile Rows</Label>
                                            <Input
                                                id="mobileRows"
                                                type="number"
                                                min="1"
                                                max="6"
                                                value={pendingGridConfig.mobileRows}
                                                onChange={(e) =>
                                                    handleGridConfigChangeWithValidation({
                                                        ...pendingGridConfig,
                                                        mobileRows: parseInt(e.target.value) || 1,
                                                    })
                                                }
                                                className="h-10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mobileColumns" className="text-sm font-medium">Mobile Columns</Label>
                                            <Input
                                                id="mobileColumns"
                                                type="number"
                                                min="1"
                                                max="4"
                                                value={pendingGridConfig.mobileColumns}
                                                onChange={(e) =>
                                                    handleGridConfigChangeWithValidation({
                                                        ...pendingGridConfig,
                                                        mobileColumns: parseInt(e.target.value) || 1,
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
                                                disabled={isGeneratingGrid || validationError}
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
                            </div>
                        </CardContent>
                    </Card>

                    <BannerUpload
                        bannerImage={bannerImage}
                        onBannerImageUpload={handleBannerImageUpload}
                        onBannerImageRemove={handleBannerImageRemove}
                        bannerImageMobile={bannerImageMobile}
                        onBannerImageMobileUpload={handleBannerImageMobileUpload}
                        onBannerImageMobileRemove={handleBannerImageMobileRemove}
                        backgroundImage={backgroundImage}
                        onBackgroundImageUpload={handleBackgroundImageUpload}
                        onBackgroundImageRemove={handleBackgroundImageRemove}
                    />

                    <Card data-section="grid-builder" className="overflow-auto">
                        <CardHeader>
                            <CardTitle className="text-lg">Grid Builder</CardTitle>
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
                                bannerImageMobile={getDisplayUrl(bannerImageMobile)}
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
                        <DialogTitle>Confirm Grid Change</DialogTitle>
                        <DialogDescription>
                            {(() => {
                                const currentTotal = gridConfig.rows * gridConfig.columns;
                                const newTotal = pendingGridConfig.rows * pendingGridConfig.columns;

                                if (newTotal < currentTotal) {
                                    const itemsToRemove = currentTotal - newTotal;
                                    return `Reducing grid size will remove ${itemsToRemove} item(s) from the end. Items 1-${newTotal} will be preserved. Are you sure you want to continue?`;
                                } else if (newTotal > currentTotal) {
                                    const itemsToAdd = newTotal - currentTotal;
                                    return `Increasing grid size will add ${itemsToAdd} empty item(s). All existing content will be preserved. Are you sure you want to continue?`;
                                } else {
                                    return "No changes detected in grid dimensions.";
                                }
                            })()}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseConfirmDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmGridChange}>
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Content Type Change Dialog */}
            <Dialog open={showContentTypeDialog} onOpenChange={setShowContentTypeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Content Type</DialogTitle>
                        <DialogDescription>
                            Changing the content type will clear all existing content. Are you sure you want to continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseContentTypeDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmContentTypeChange}>
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GridConfigEditor; 