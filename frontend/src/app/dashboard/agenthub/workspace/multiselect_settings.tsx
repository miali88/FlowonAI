import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  data_type: string;
}

interface MultiSelectProps {
  items: Item[];
  selectedItems: Item[];
  onChange: (items: Item[]) => void;
  defaultValue?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ items, selectedItems, onChange, defaultValue }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('Current selectedItems:', selectedItems);
  }, [selectedItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isItemSelected = (item: Item): boolean => {
    return selectedItems?.some(selected => selected.id === item.id) || false;
  };

  const toggleItem = (item: Item) => {
    let newSelectedItems: Item[];

    if (isItemSelected(item)) {
      // Remove item if already selected
      newSelectedItems = selectedItems.filter(selected => selected.id !== item.id);
    } else {
      // Add item if not selected
      newSelectedItems = [...(selectedItems || []), item];
    }

    console.log('Toggling item:', item);
    console.log('New selected items:', newSelectedItems);
    onChange(newSelectedItems);
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 text-left bg-background border rounded-md flex items-center justify-between hover:bg-accent focus:outline-none"
      >
        <span className="truncate text-sm">
          {selectedItems?.length > 0
            ? selectedItems.map(item => item.title).join(', ')
            : "Select items..."}
        </span>
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
                className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                  isItemSelected(item) ? 'bg-primary border-primary' : 'border-primary'
                }`}>
                  {isItemSelected(item) && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="ml-2 text-sm">{item.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{item.data_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};