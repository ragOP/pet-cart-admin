import React, { useCallback, useMemo } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { SaveIcon, AlertCircle } from "lucide-react";
import { usePageConfig } from "../hooks/usePageConfig";
import SortableSectionItem from "./SortableSectionItem";

const PageConfigEditor = ({ pageKey, pageConfig }) => {
    const {
        sections,
        isLoading,
        isSaving,
        handleSectionsReorder,
        handleSave,
        hasUnsavedChanges,
        error
    } = usePageConfig(pageKey);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;

        if (active.id !== over?.id && over) {
            const oldIndex = parseInt(active.id.split('-')[1]);
            const newIndex = parseInt(over.id.split('-')[1]);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const newSections = arrayMove(sections, oldIndex, newIndex);
                handleSectionsReorder(newSections);
            }
        }
    }, [sections, handleSectionsReorder]);

    const handleSaveClick = useCallback(async () => {
        try {
            await handleSave();
        } catch (error) {
            console.error("Save error:", error);
        }
    }, [handleSave]);

    // Memoize items to prevent unnecessary re-renders
    const sortableItems = useMemo(() => 
        sections.map((_, index) => `section-${index}`), 
        [sections.length]
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <CustomSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Failed to load page sections</h3>
                    <p className="text-muted-foreground">
                        {error.message || "An error occurred while loading the page sections"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold capitalize">
                        {pageKey.replace(/_/g, ' ')} Page Sections
                    </h2>
                    <p className="text-muted-foreground">
                        Drag and drop to reorder the sections that appear on this page
                    </p>
                </div>
                <Button
                    onClick={handleSaveClick}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="flex items-center gap-2"
                >
                    <SaveIcon className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Order"}
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sortableItems}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {sections.map((section, index) => (
                            <SortableSectionItem
                                key={`section-${index}`}
                                id={`section-${index}`}
                                section={section}
                                index={index}
                                isDisabled={isSaving}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {sections.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">No sections found for this page</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PageConfigEditor; 