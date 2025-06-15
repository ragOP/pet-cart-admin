import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; // utility for conditional classNames
import { useState } from "react";

const MultiSelectBreeds = ({ breeds, value, onChange }) => {
  const [open, setOpen] = useState(false);

  const toggleBreed = (breedId) => {
    if (value.includes(breedId)) {
      onChange(value.filter((id) => id !== breedId));
    } else {
      onChange([...value, breedId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {value.length > 0
            ? `${value.length} selected`
            : "Select breeds"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search breeds..." />
          <CommandEmpty>No breed found.</CommandEmpty>
          <CommandGroup>
            {breeds.map((breed) => (
              <CommandItem
                key={breed._id}
                onSelect={() => toggleBreed(breed._id)}
              >
                <div className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value.includes(breed._id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {breed.name}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectBreeds;