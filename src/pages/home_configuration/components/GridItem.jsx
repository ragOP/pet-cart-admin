import React, { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Move, Link as LinkIcon } from "lucide-react";
import ContentSelector from "./ContentSelector";

const GridItem = ({
  item,
  onImageUpload,
  onRemoveImage,
  onLinkChange,
  onDatabaseImageSelect,
  contentType,
}) => {
  const fileInputRef = useRef(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageUpload(item.id, file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      onImageUpload(item.id, files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isSortableDragging ? "scale-105" : ""
      }`}
    >
      <Card className={`${isSortableDragging ? "ring-2 ring-primary" : ""} px-0 py-1`}>
        <CardContent className="p-3 px-4 space-y-2">
          {/* Drag Handle and Position */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-medium">
              Position {item.position + 1}
            </div>
            <div
              {...attributes}
              {...listeners}
              className="cursor-move hover:bg-muted p-1 rounded"
            >
              <Move className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Image Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg transition-colors min-h-[12rem] flex items-center justify-center ${
              item.image
                ? "border-primary bg-primary/5 p-2"
                : "border-muted-foreground/25 hover:border-primary/50 p-4"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {item.image ? (
              <div className="relative w-full h-full">
                <img
                  src={item.image}
                  alt="Product"
                  className="w-full h-full object-cover rounded min-h-[15rem] max-h-[15rem]"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                  onClick={() => onRemoveImage(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2 min-h-[14rem] max-h-[14rem] flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div className="text-sm text-muted-foreground text-center">
                  <p>Drop image here or</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-primary cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    click to upload
                  </Button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Database Image Selection */}
          <ContentSelector
            contentType={contentType}
            onSelect={(selectedItem) => onDatabaseImageSelect(item.id, selectedItem)}
            currentItem={item.itemId ? item : null}
          />

          {/* Link Field */}
          <div className="space-y-2">
            <Label htmlFor={`link-${item.id}`} className="text-xs font-medium flex items-center gap-1">
              <LinkIcon className="w-3 h-3" />
              Link
            </Label>
            <Input
              id={`link-${item.id}`}
              value={item.link || ""}
              onChange={(e) => onLinkChange(item.id, e.target.value)}
              placeholder="Enter link URL"
              className="h-8 text-xs"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default GridItem; 