'use client';

import { Dispatch, SetStateAction } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { KnowledgeBaseTable } from './KnowledgeBaseTable';
import { KnowledgeBaseItem, WebContent } from './types';

interface LibraryProps {
  savedItems: KnowledgeBaseItem[];
  totalTokens: number;
  selectedItem: KnowledgeBaseItem | null;
  setSelectedItem: Dispatch<SetStateAction<KnowledgeBaseItem | null>>;
  setNewItemContent: Dispatch<SetStateAction<string>>;
  handleDeleteItem: (id: number) => Promise<void>;
}

export function Library({
  savedItems,
  totalTokens,
  selectedItem,
  setSelectedItem,
  setNewItemContent,
  handleDeleteItem,
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
            // If content is an array of web content, we don't want to set it as editing content
            if (typeof item.content === 'string') {
              setNewItemContent(item.content);
            } else {
              // For web content, we might set some placeholder or just leave it empty
              setNewItemContent('');
            }
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
              {selectedItem.data_type === 'web' && Array.isArray(selectedItem.content) ? (
                <div className="space-y-4">
                  {(selectedItem.content as WebContent[]).map((urlItem: WebContent) => (
                    <div key={String(urlItem.id)} className="border-b pb-2">
                      <p className="text-sm font-medium">{urlItem.url}</p>
                      <p className="text-sm text-muted-foreground">
                        Token count: {urlItem.token_count}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{typeof selectedItem.content === 'string' ? selectedItem.content : JSON.stringify(selectedItem.content, null, 2)}</p>
              )}
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

