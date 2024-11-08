import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  countryCodes: {
    countries: string[];
  };
}

const getCountryFlag = (countryCode: string): string => {
  // Convert country code to regional indicator symbols
  // Each letter needs to be converted to the corresponding regional indicator symbol
  // by adding 127397 to its UTF-16 code unit
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

export const MultiSelect: React.FC<MultiSelectProps> = ({ items, selectedItems, onChange, countryCodes = {} }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");

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

  const handleOpenClick = () => {
    setOpen(!open);
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
               maxWidth: containerRef.current?.offsetWidth,
               left: containerRef.current?.getBoundingClientRect().left,
               top: containerRef.current?.getBoundingClientRect().bottom + window.scrollY + 5
             }}>
          <div className="p-2">
            <PurchaseNumber 
              countryCodes={countryCodes}
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