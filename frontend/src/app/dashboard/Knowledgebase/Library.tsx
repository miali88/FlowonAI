'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { KnowledgeBaseTable } from './KnowledgeBaseTable';

interface LibraryProps {
  savedItems: any[];
  totalTokens: number;
  selectedItem: any;
  setSelectedItem: (item: any) => void;
  setIsEditing: (value: boolean) => void;
  setNewItemContent: (content: string) => void;
  handleDeleteItem: (id: number) => void;
}

export function Library({
  savedItems,
  totalTokens,
  selectedItem,
  setSelectedItem,
  setIsEditing,
  setNewItemContent,
  handleDeleteItem
}: LibraryProps) {
  return (
    <div className="flex w-full">
      {/* Left section with table (2/3 width) */}
      <div className="w-2/3 p-4">
        <KnowledgeBaseTable
          data={savedItems}
          totalTokens={totalTokens}
          onEdit={(item) => {
            setSelectedItem(item);
            setIsEditing(true);
            setNewItemContent(item.content);
          }}
          onDelete={handleDeleteItem}
          setSelectedItem={setSelectedItem}
        />
      </div>

      {/* Right section with content preview (1/3 width) */}
      <div className="w-1/3 p-4 border-l">
        {selectedItem ? (
          <div className="h-full">
            <h3 className="text-xl font-semibold mb-4">{selectedItem.title}</h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <p className="whitespace-pre-wrap">{selectedItem.content}</p>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select an item to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

