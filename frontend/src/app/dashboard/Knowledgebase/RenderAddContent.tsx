import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Globe } from "lucide-react";

interface RenderAddContentProps {
  activeAddTab: string;
  newItemContent: string;
  setNewItemContent: (content: string) => void;
  getRootProps: () => any;
  getInputProps: () => any;
  isDragActive: boolean;
  selectedFile: File | null;
  scrapeUrl: string;
  setScrapeUrl: (url: string) => void;
  handleScrape: (e: React.FormEvent) => Promise<void>;
}

export const RenderAddContent: React.FC<RenderAddContentProps> = ({
  activeAddTab,
  newItemContent,
  setNewItemContent,
  getRootProps,
  getInputProps,
  isDragActive,
  selectedFile,
  scrapeUrl,
  setScrapeUrl,
  handleScrape
}) => {
  switch (activeAddTab) {
    case 'text':
      return (
        <Textarea 
          placeholder="Type or paste anything that will help Flowon learn more about your business"
          className="w-full h-[calc(100vh-400px)] p-4 bg-background border border-input mb-4"
          value={newItemContent}
          onChange={(e) => setNewItemContent(e.target.value)}
        />
      );

    case 'files':
      return (
        <div 
          {...getRootProps()} 
          className={`flex flex-col items-center justify-center h-[calc(100vh-400px)] border-2 border-dashed ${isDragActive ? 'border-primary' : 'border-gray-300'} rounded-lg transition-colors duration-300 cursor-pointer`}
        >
          <input {...getInputProps()} />
          <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-gray-400'} mb-4`} />
          <p className="text-sm text-gray-600 text-center">
            {isDragActive 
              ? "Drop the files here" 
              : "Drag and drop files here, or click to select files"}
          </p>
          {selectedFile && (
            <p className="mt-4 text-sm text-gray-600">
              Selected file: {selectedFile.name}
            </p>
          )}
        </div>
      );
    case 'web':
      return (
        <div className="flex flex-col h-[calc(100vh-400px)]">
          <Input
            type="url"
            placeholder="Enter URL to scrape"
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleScrape} className="self-start px-4 py-2">
            Scrape Web Content
          </Button>
        </div>
      );
    case 'connect':
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)]">
          <Globe className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect to External Sources</h3>
          <p className="text-sm text-gray-600 mb-4">Integrate with external platforms to import data</p>
          <Button>Configure Connections</Button>
        </div>
      );
    case 'codebase':
      return (
        <div className="flex flex-col h-[calc(100vh-400px)]">
          <Textarea 
            placeholder="Paste your code here or provide a link to your repository"
            className="w-full h-full p-4 bg-background border border-input mb-4"
            value={newItemContent}
            onChange={(e) => setNewItemContent(e.target.value)}
          />
          <Button className="self-start px-4 py-2">
            Process Codebase
          </Button>
        </div>
      );
    default:
      return null;
  }
};
