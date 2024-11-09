import React, { useState, useRef, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  id: string | number;
  title: string;
  data_type?: string;
  file?: string;
}

interface MultiSelectProps {
  items: Item[];
  selectedItems: Item[];
  onChange: (items: Item[]) => void;
  placeholder?: string;
  multiSelect?: boolean;
}

export function MultiSelect({ 
  items, 
  selectedItems, 
  onChange, 
  placeholder = "Select items...", 
  multiSelect = true 
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (item: Item) => {
    if (multiSelect) {
      const isSelected = selectedItems.some(selected => selected.id === item.id);
      let newSelection;
      
      if (isSelected) {
        newSelection = selectedItems.filter(selected => selected.id !== item.id);
      } else {
        if (item.id === -1) {
          newSelection = [item];
        } else if (selectedItems.some(selected => selected.id === -1)) {
          newSelection = [item];
        } else {
          newSelection = [...selectedItems, {
            id: item.id,
            title: item.title,
            data_type: item.data_type,
            file: item.file
          }];
        }
      }
      onChange(newSelection);
    } else {
      onChange([{
        id: item.id,
        title: item.title,
        data_type: item.data_type,
        file: item.file
      }]);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent text-foreground dark:text-gray-200 border-gray-600 focus:bg-gray-800"
        >
          {selectedItems.length > 0
            ? multiSelect
              ? selectedItems.some(item => item.id === -1)
                ? "All items selected"
                : `${selectedItems.length} item${selectedItems.length === 1 ? '' : 's'} selected`
              : selectedItems[0].title
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search items..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>No items found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={String(item.id)}
                onSelect={() => handleSelect(item)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedItems.some(selected => selected.id === item.id)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
