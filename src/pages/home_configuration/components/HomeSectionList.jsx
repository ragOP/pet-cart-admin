import React from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { SaveIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import SortableSectionItem from "./SortableSectionItem";

const HomeSectionList = ({
    sections,
    isLoading,
    isSaving,
    onSectionsReorder,
    onSave,
    hasUnsavedChanges,
    error
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = sections.findIndex((section) => section.id === active.id);
            const newIndex = sections.findIndex((section) => section.id === over.id);

            const newSections = arrayMove(sections, oldIndex, newIndex);
            onSectionsReorder(newSections);
        }
    };

    const handleSave = async () => {
        try {
            await onSave();
        } catch (error) {
            // Error is already handled in the mutation
            console.error("Save error:", error);
        }
    };

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
                    <h3 className="text-lg font-semibold">Failed to load sections</h3>
                    <p className="text-muted-foreground">
                        {error.message || "An error occurred while loading the sections"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground">
                        Drag and drop to reorder the sections that appear on your homepage
                    </p>
                </div>
                <Button
                    onClick={handleSave}
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
                    items={sections.map(section => section.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {sections.map((section, index) => (
                            <SortableSectionItem
                                key={section.id}
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
                        <p className="text-muted-foreground">No sections found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default HomeSectionList; 