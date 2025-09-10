import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Save } from "lucide-react";

const SaveConfigBox = ({ 
  hasUnsavedChanges, 
  isSaving, 
  onSave, 
  onPreview,
  variant = "default" // "default" or "compact" for top placement
}) => {
  return (
    <div className="flex justify-end space-x-3">
      {hasUnsavedChanges && (
        <div className="flex items-center text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
          <span className="flex items-center gap-2">
            <span>⚠️</span>
            <span>You have unsaved changes</span>
          </span>
        </div>
      )}
      <Button 
        onClick={isSaving ? undefined : onPreview} 
        variant="outline" 
        disabled={isSaving}
        className={isSaving ? "cursor-not-allowed" : "cursor-pointer"}
      >
        <Eye className="h-4 w-4 mr-2" />
        Preview Grid
      </Button>
      <Button
        onClick={isSaving ? undefined : onSave}
        variant="default"
        disabled={!hasUnsavedChanges || isSaving}
        className={`${variant === "compact" ? "min-w-[140px]" : "min-w-[180px]"} ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isSaving ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{variant === "compact" ? "Saving..." : "Saving Configuration..."}</span>
          </div>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            {variant === "compact" ? "Save Config" : "Save Configuration"}
          </>
        )}
      </Button>
    </div>
  );
};

export default SaveConfigBox; 