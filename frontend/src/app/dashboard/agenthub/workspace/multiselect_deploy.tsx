import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { PurchaseNumber } from './PurchaseNumber';

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
  countries?: string[];
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ items, selectedItems, onChange, countries = [] }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleItem = (item: Item, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    if (isSelected) {
      onChange([]);
    } else {
      onChange([item]);
    }
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
            ? "Select a phone number..."
            : selectedItems[0].title}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="fixed inset-x-0 top-full mt-2 w-full bg-background rounded-md border border-input shadow-lg z-[100]"
             style={{
               maxWidth: containerRef.current?.offsetWidth ?? 0,
               left: containerRef.current?.getBoundingClientRect()?.left ?? 0,
               top: (containerRef.current?.getBoundingClientRect()?.bottom ?? 0) + window.scrollY + 5
             }}>
          <div className="p-2">
            <PurchaseNumber 
              countries={countries}
              onNumberPurchased={(number) => {
                // Handle purchased number
                console.log('Number purchased:', number);
                // You might want to refresh the list of available numbers here
              }}
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={(e) => toggleItem(item, e)}
                className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-3"
                data-index={index}
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