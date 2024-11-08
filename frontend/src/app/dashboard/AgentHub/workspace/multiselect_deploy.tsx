import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

export const MultiSelect: React.FC<MultiSelectProps> = ({ items, selectedItems, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const toggleItem = (item: Item) => {
    onChange(
      selectedItems.find(selected => selected.id === item.id)
        ? selectedItems.filter(selected => selected.id !== item.id)
        : [...selectedItems, item]
    );
  };

  const removeItem = (itemToRemove: Item) => {
    onChange(selectedItems.filter(item => item.id !== itemToRemove.id));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 text-left bg-background border rounded-md flex items-center justify-between hover:bg-accent focus:outline-none"
      >
        <span className="truncate text-sm">
          {selectedItems.length === 0
            ? "Select items..."
            : selectedItems.map(item => item.title).join(', ')}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute mt-2 w-full bg-background rounded-md border border-input shadow-lg z-50">
          <div className="p-2">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2 rounded-sm">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Purchase a new number</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Purchase Phone Number</DialogTitle>
                  <DialogDescription>
                    Select a phone number to purchase for your agent.
                  </DialogDescription>
                </DialogHeader>
                {/* Add your phone number purchase form here */}
              </DialogContent>
            </Dialog>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {items.filter(item => item.id !== 'purchase').map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item)}
                className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-3"
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                  selectedItems.some(selected => selected.id === item.id) 
                    ? 'bg-primary border-primary' 
                    : 'border-input'
                }`}>
                  {selectedItems.some(selected => selected.id === item.id) && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm flex-1">{item.title}</span>
                <span className="text-xs text-muted-foreground ml-2">{item.data_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}    
    </div>
  );
};