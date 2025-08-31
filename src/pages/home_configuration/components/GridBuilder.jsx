import React from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import GridItem from "./GridItem";
import { useGridBuilder } from "../hooks/useGridBuilder";

const GridBuilder = ({ 
  gridConfig, 
  gridItems, 
  onGridItemsUpdate, 
  onLinkChange, 
  onDatabaseImageSelect, 
  contentType 
}) => {
  const {
    sensors,
    handleDragEnd,
    handleImageUpload,
    handleRemoveImage,
    getGridStyle,
    rectSortingStrategy,
  } = useGridBuilder(gridItems, onGridItemsUpdate);

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={gridItems} strategy={rectSortingStrategy}>
          <div style={getGridStyle(gridConfig)}>
            {gridItems.map((item) => (
              <GridItem
                key={item.id}
                item={item}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                onLinkChange={onLinkChange}
                onDatabaseImageSelect={onDatabaseImageSelect}
                contentType={contentType}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default GridBuilder; 