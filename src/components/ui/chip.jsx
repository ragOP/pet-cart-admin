import React from "react";
import { cn } from "@/lib/utils";

export function Chip({ active, children, onClick, className, onFilterSelect }) {
  return (
    <button
      type="button"
      onClick={
        onFilterSelect
          ? () => onFilterSelect({ key: title, value: String(children) })
          : onClick
      }
      className={cn(
        "px-3 py-1.5 text-sm rounded-md border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-input hover:bg-accent/60",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ChipGroup({
  title,
  options = [],
  values = [],
  onToggle,
  onFilterSelect,
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = values.includes(String(opt.value));
          return (
            <Chip
              key={opt.value}
              active={isActive}
              onClick={() => {
                onToggle?.(opt.value);
                onFilterSelect?.({ key: title, value: opt.value });
              }}
            >
              {opt.label}
            </Chip>
          );
        })}
      </div>
      <div className="h-px bg-border mt-3" />
    </div>
  );
}
