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
import { Eye, Save } from "lucide-react";

import NavbarItem from "@/components/navbar/navbar_items";
import GridBuilder from "./components/GridBuilder";
import GridPreview from "./components/GridPreview";
import { useHomeConfiguration } from "./hooks/useHomeConfiguration";
import { usePageLeaveConfirmation } from "./hooks/usePageLeaveConfirmation";

const HomeConfiguration = () => {
    const {
        // State
        title,
        contentType,
        gridConfig,
        pendingGridConfig,
        gridItems,
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
        handleSave,
        handlePreview,
        handleCloseConfirmDialog,
        handleCloseContentTypeDialog,

        // Utility functions
        hasUnsavedChanges,
    } = useHomeConfiguration();

    // Use page leave confirmation hook
    usePageLeaveConfirmation(hasUnsavedChanges);

    const breadcrumbs = [{ title: "Home Configuration", isNavigation: false }];

    return (
        <div className="flex flex-col">
            <NavbarItem
                title="Home Configuration"
                breadcrumbs={breadcrumbs}
            />

            <div className="py-1 px-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="builder">Grid Builder</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="builder" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Grid Configuration</CardTitle>
                                <CardDescription>
                                    Configure your grid settings and layout
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                                            <Input
                                                id="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Enter grid title"
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
                                <div className="mt-6 flex justify-end space-x-3">
                                    {hasUnsavedChanges() && (
                                        <div className="flex items-center text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
                                            <span className="flex items-center gap-2">
                                                <span>⚠️</span>
                                                <span>You have unsaved changes</span>
                                            </span>
                                        </div>
                                    )}
                                    <Button
                                        onClick={handleSave}
                                        variant="default"
                                        disabled={!hasUnsavedChanges() || isSaving}
                                        className="min-w-[180px]"
                                    >
                                        {isSaving ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Saving...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Configuration
                                            </>
                                        )}
                                    </Button>
                                    <Button onClick={handlePreview} className="cursor-pointer">
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview Grid
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-6">
                        <Card>
                            <CardContent>
                                <GridPreview gridConfig={gridConfig} gridItems={gridItems} title={title} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

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

export default HomeConfiguration; 