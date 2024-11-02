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
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ items, selectedItems, onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 text-left bg-white border rounded-lg flex items-center justify-between hover:bg-gray-50"
      >
        <span className="truncate">
          {selectedItems.length === 0
            ? "Select items..."
            : selectedItems.map(item => item.title).join(', ')}
        </span>
        <ChevronsUpDown className="h-4 w- 4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute mt-1 w-full bg-white rounded-lg border shadow-lg z-10">
          {/* Search input */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Items list */}
          <div className="max-h-60 overflow-auto">
            {filteredItems.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">
                No items found.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                >
                  <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                    selectedItems.some(selected => selected.id === item.id) 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedItems.some(selected => selected.id === item.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{item.title}</span>
                  <span className="text-xs text-gray-500">{item.data_type}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}    
    </div>
  );
};
