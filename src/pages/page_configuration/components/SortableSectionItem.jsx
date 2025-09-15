import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

const SortableSectionItem = memo(({ id, section, index, isDisabled }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: id,
        disabled: isDisabled
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition, // No transition during drag
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    // Format section key for display
    // const formatSectionKey = (key) => {
    //     return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    // };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white border rounded-lg p-4 shadow-sm ${
                isDragging ? 'shadow-xl ring-2 ring-primary ring-opacity-50' : 'hover:shadow-md'
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className={`cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 rounded ${
                            isDisabled ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Section Info */}
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                                {section.label}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                                {section.type || 'Section'}
                            </Badge>
                            {section.position && (
                                <Badge variant="outline" className="text-xs">
                                    Position: {section.position}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Type: {section.type || 'Unknown'}</span>
                            <span>Key: {section.key}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

SortableSectionItem.displayName = 'SortableSectionItem';

export default SortableSectionItem; 