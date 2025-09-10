import { useCallback } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

export const useGridBuilder = (gridItems, onGridItemsUpdate) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = gridItems.findIndex((item) => item.id === active.id);
      const newIndex = gridItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(gridItems, oldIndex, newIndex);
      
      // Update positions
      newItems.forEach((item, index) => {
        item.position = index;
      });

      onGridItemsUpdate(newItems);
    }
  }, [gridItems, onGridItemsUpdate]);

  const handleImageUpload = useCallback((itemId, file) => {
    // Store the file directly - will be processed during save
    const updatedItems = gridItems.map((item) =>
      item.id === itemId
        ? { ...item, image: file }
        : item
    );
    onGridItemsUpdate(updatedItems);
  }, [gridItems, onGridItemsUpdate]);

  const handleRemoveImage = useCallback((itemId) => {
    const updatedItems = gridItems.map((item) =>
      item.id === itemId ? { ...item, image: null } : item
    );
    onGridItemsUpdate(updatedItems);
  }, [gridItems, onGridItemsUpdate]);

  const getGridStyle = useCallback((gridConfig) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
    gap: "1rem",
    padding: "1rem",
    backgroundColor: "#f8fafc",
    borderRadius: "0.5rem",
    minHeight: "400px",
  }), []);

  return {
    sensors,
    handleDragEnd,
    handleImageUpload,
    handleRemoveImage,
    getGridStyle,
    rectSortingStrategy,
  };
}; 