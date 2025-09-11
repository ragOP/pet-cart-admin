import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";

const SortableSectionItem = ({ section, index, isDisabled }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`transition-all duration-200 ${isDragging ? 'z-50' : ''}`}
        >
            <Card className={`transition-all duration-200 hover:shadow-md ${isDragging ? 'shadow-lg' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                {index + 1}
                            </div>
                            <CardTitle className="text-lg">{section.label}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                {...attributes}
                                {...listeners}
                                className={`p-2 cursor-grab active:cursor-grabbing hover:bg-muted rounded-md transition-colors ${
                                    isDisabled ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};

export default SortableSectionItem; 