import React, { useState, useRef, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  id: number;
  title: string;
  data_type: string;
}

interface MultiSelectProps {
  items: Item[];
  selectedItems: Item[];
  onChange: (items: Item[]) => void;
}

export function MultiSelect({ items, selectedItems, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  console.log('MultiSelect render - items:', items);
  console.log('MultiSelect render - selectedItems:', selectedItems);

  const handleSelect = (item: Item) => {
    console.log('handleSelect called with item:', item);
    
    const isSelected = selectedItems.some(
      selected => selected.id === item.id
    );
    console.log('isSelected:', isSelected);
    
    let newSelection;
    if (isSelected) {
      newSelection = selectedItems.filter(selected => selected.id !== item.id);
    } else {
      if (item.id === -1) {
        newSelection = [item];
      } else if (selectedItems.some(selected => selected.id === -1)) {
        newSelection = [item];
      } else {
        newSelection = [...selectedItems, item];
      }
    }
    
    console.log('newSelection:', newSelection);
    onChange(newSelection);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItems.length > 0
            ? selectedItems.map(item => item.title).join(', ')
            : "Select data sources..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search data sources..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>No data sources found.</CommandEmpty>
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
