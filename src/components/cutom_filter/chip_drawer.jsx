import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipGroup } from "@/components/ui/chip";

export default function ChipFilterDrawer({
  open,
  onOpenChange,
  title = "Filters",
  searchText,
  onSearchChange,
  sections = [], // [{ key, title, options:[{value,label}] }]
  values = {}, // { [key]: string[] }
  onChange,
  onApply,
  onClear,
  onFilterSelect,
}) {
  const handleToggle = (sectionKey, value) => {
    const current = (values[sectionKey] || []).map(String);
    const exists = current.includes(String(value));
    const next = exists
      ? current.filter((v) => v !== String(value))
      : [...current, String(value)];
    onChange?.({
      ...values,
      [sectionKey]: next.length ? next : [],
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-sm max-h-[100dvh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {onSearchChange && (
            <Input
              placeholder="Search"
              value={searchText}
              onChange={onSearchChange}
            />
          )}

          {sections.map((sec, i) => (
            <ChipGroup
              key={sec.key ?? `${sec.title ?? "section"}-${i}`}
              title={sec.title}
              options={sec.options}
              values={(values[sec.key] || []).map(String)}
              onToggle={(v) => handleToggle(sec.key, v)}
              onFilterSelect={onFilterSelect}
              sectionKey={sec.key}
            />
          ))}
        </div>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-red-500" onClick={onClear}>
              Clear All
            </Button>
            <DrawerClose asChild>
              <Button onClick={onApply}>Apply</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
