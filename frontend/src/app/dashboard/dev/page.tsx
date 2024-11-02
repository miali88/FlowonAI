'use client';

import { MultiSelect } from "@/components/multiselect";
import { useState } from 'react';

export default function DevPage() {
  const [selectedItems, setSelectedItems] = useState<Array<{
    id: string;
    title: string;
    data_type: string;
  }>>([]);

  const options = [
    { id: "1", title: "Option 1", data_type: "Tag 1" },
    { id: "2", title: "Option 2", data_type: "Tag 2" },
    { id: "3", title: "Option 3", data_type: "Tag 3" },
  ];

  return (
    <div className="p-4 max-w-md">
      <MultiSelect 
        items={options}
        selectedItems={selectedItems}
        onChange={setSelectedItems}
      />
    </div>
  );
}
