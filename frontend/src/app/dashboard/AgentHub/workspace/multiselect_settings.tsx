import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

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
  const initialSelectionMade = useRef(false);
  const previousDefaultValue = useRef(defaultValue);

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

  useEffect(() => {
    if (defaultValue !== previousDefaultValue.current) {
      initialSelectionMade.current = false;
      previousDefaultValue.current = defaultValue;
    }

    if (defaultValue && selectedItems.length === 0 && !initialSelectionMade.current) {
      const initialSelection = items.filter(item => 
        defaultValue === 'all' ? item.id === 'all' : defaultValue.includes(item.id)
      );
      if (initialSelection.length > 0) {
        initialSelectionMade.current = true;
        onChange(initialSelection);
      }
    }
  }, [defaultValue, items, onChange, selectedItems]);

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

  const filteredItems = items.filter(item =>
    item?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Dropdown trigger button - fixed padding and alignment */}
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

      {/* Dropdown menu - improved styling */}
      {open && (
        <div className="absolute mt-2 w-full bg-background rounded-md border border-input shadow-lg z-50 max-h-[80vh] flex flex-col">
          {/* Search input - improved padding and border */}
          <div className="p-2 border-b border-input sticky top-0 bg-background">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Items list - improved scrolling and spacing */}
          <div className="overflow-y-auto flex-1">
            {filteredItems.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No items found.
              </div>
            ) : (
              filteredItems.map((item) => (
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
              ))
            )}
          </div>
        </div>
      )}    
    </div>
  );
};