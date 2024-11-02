'use client';

import { MultiSelect } from "@/components/multiselect";
import { useState } from 'react';

// Define reusable type for items
export type SelectItem = {
  id: string;
  title: string;
  data_type: string;
};

// Create a reusable component
export function SelectWrapper({
  options,
  initialSelected = [],
  onChange,
}: {
  options: SelectItem[];
  initialSelected?: SelectItem[];
  onChange?: (items: SelectItem[]) => void;
}) {
  const [selectedItems, setSelectedItems] = useState<SelectItem[]>(initialSelected);

  const handleChange = (items: SelectItem[]) => {
    setSelectedItems(items);
    onChange?.(items);
  };

  return (
    <div className="p-4 max-w-md">
      <MultiSelect 
        items={options}
        selectedItems={selectedItems}
        onChange={handleChange}
      />
    </div>
  );
}

// Example usage in the page component
export default function DevPage() {
  const options: SelectItem[] = [
    { id: "190299", title: "Flowon.ai/dev", data_type: "web" },
    { id: "290299", title: "Flowon.ai/prod", data_type: "pdf" },
    { id: "390299", title: "Flowon.ai/test", data_type: "excel" },
  ];

  return <SelectWrapper options={options} />;
}
