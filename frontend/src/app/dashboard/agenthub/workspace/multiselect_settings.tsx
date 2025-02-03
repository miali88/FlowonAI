import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

interface Item {
  id: string;
  title: string;
  data_type: string;
}

interface MultiSelectProps {
  items: Item[];
  selectedItems: Item[];
  onChange: (items: Item[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  items,
  selectedItems = [],
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log("Current selectedItems:", selectedItems);
  }, [selectedItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isItemSelected = (item: Item): boolean => {
    return (
      Array.isArray(selectedItems) &&
      selectedItems.some((selected) => selected.id === item.id)
    );
  };

  const toggleItem = (item: Item) => {
    if (!Array.isArray(selectedItems)) {
      onChange([item]);
      return;
    }

    const currentSelected = [...selectedItems];
    let newSelectedItems: Item[];

    if (isItemSelected(item)) {
      // Remove item if already selected
      newSelectedItems = currentSelected.filter(
        (selected) => selected.id !== item.id
      );
    } else {
      // Add item if not selected
      newSelectedItems = [...currentSelected, item];
    }

    onChange(newSelectedItems);
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDisplayText = () => {
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      return "Select items...";
    }
    try {
      return selectedItems.map((item) => item.title).join(", ");
    } catch (error) {
      console.error("Error processing selectedItems:", error, selectedItems);
      return "Select items...";
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 text-left bg-background border rounded-md flex items-center justify-between hover:bg-slate-600 focus:outline-none"
      >
        <span className="truncate text-sm">{getDisplayText()}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute mt-2 w-full bg-background rounded-md border shadow-lg z-50">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item)}
                className="flex items-center px-3 py-2 hover:bg-slate-600 cursor-pointer"
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                    isItemSelected(item)
                      ? "bg-primary border-primary"
                      : "border-primary"
                  }`}
                >
                  {isItemSelected(item) && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="ml-2 text-sm">{item.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.data_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
