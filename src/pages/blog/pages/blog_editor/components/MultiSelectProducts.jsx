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
import { cn } from "@/lib/utils";
import { useState } from "react";

const MultiSelectProducts = ({ products, value, onChange }) => {
  const [open, setOpen] = useState(false);

  const toggleProduct = (productId) => {
    if (value.includes(productId)) {
      onChange(value.filter((id) => id !== productId));
    } else {
      onChange([...value, productId]);
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
            : "Select products"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandEmpty>No product found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-auto">
            {products.map((product) => (
              <CommandItem
                key={product._id}
                onSelect={() => toggleProduct(product._id)}
              >
                <div className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value.includes(product._id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-gray-500">₹{product.price}</div>
                    </div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectProducts; 