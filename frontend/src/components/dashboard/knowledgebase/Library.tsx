'use client';

import { Dispatch, SetStateAction } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { KnowledgeBaseTable } from './KnowledgeBaseTable';

interface UrlContent {
  id: number;
  url: string;
  token_count: number;
}

interface KnowledgeBaseItem {
  id: number;
  title: string;
  content: string;
  data_type: 'web' | 'text';
  tag: string;
  tokens: number;
  created_at: string;
}

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
              {selectedItem.data_type === 'web' && Array.isArray(selectedItem.content) ? (
                <div className="space-y-4">
                  {(selectedItem.content as UrlContent[]).map((urlItem: UrlContent) => (
                    <div key={urlItem.id} className="border-b pb-2">
                      <p className="text-sm font-medium">{urlItem.url}</p>
                      <p className="text-sm text-muted-foreground">
                        Token count: {urlItem.token_count}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{selectedItem.content}</p>
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

