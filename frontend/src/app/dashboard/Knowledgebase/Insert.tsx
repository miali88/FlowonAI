'use client';

import { Type, Upload, Globe, SendIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handleNewItem } from './HandleFile';

interface InsertProps {
  handleCardClick: (tab: string) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  selectedTab: string;
  newItemContent: string;
  setNewItemContent: (content: string) => void;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  scrapeUrl: string;
  setScrapeUrl: (url: string) => void;
  showScrapeInput: boolean;
  scrapeError: string;
  handleNewItemWrapper: () => void;
  handleScrapeWrapper: () => void;
  mappedUrls: string[];
  setMappedUrls: React.Dispatch<React.SetStateAction<string[]>>;
  selectedUrls: string[];
  setSelectedUrls: React.Dispatch<React.SetStateAction<string[]>>;
  handleScrapeAllWrapper: () => void;
}

export function Insert({ 
  handleCardClick, 
  dialogOpen, 
  setDialogOpen,
  selectedTab,
  newItemContent,
  setNewItemContent,
  selectedFile,
  setSelectedFile,
  scrapeUrl,
  setScrapeUrl,
  showScrapeInput,
  scrapeError,
  handleNewItemWrapper,
  handleScrapeWrapper,
  mappedUrls,
  selectedUrls,
  setSelectedUrls,
  handleScrapeAllWrapper
}: InsertProps) {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)]">
        <h2 className="text-2xl font-bold mb-4">Welcome to Your Knowledge Base</h2>
        <p className="text-gray-600 text-center max-w-2xl mb-6">
          Start building your agent's knowledge by adding content. 
          Choose from the below to begin:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center max-w-3xl mx-auto">
          <div 
            className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors"
            onClick={() => handleCardClick('text')}
          >
            <Type className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <h3 className="font-semibold">Text</h3>
            <p className="text-sm text-gray-500">View your existing knowledge base</p>
          </div>
          <div 
            className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors"
            onClick={() => handleCardClick('files')}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <h3 className="font-semibold">Document files</h3>
            <p className="text-sm text-gray-500">PDFs, word, excel, txt, powerpoint etc.</p>
          </div>
          <div 
            className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors"
            onClick={() => handleCardClick('web')}
          >
            <Globe className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <h3 className="font-semibold">Web</h3>
            <p className="text-sm text-gray-500">Scrape content from any website</p>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedTab === 'text' && 'Add Text Content'}
              {selectedTab === 'files' && 'Upload Files'}
              {selectedTab === 'web' && 'Scrape Web Content'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedTab === 'text' && (
              <Textarea 
                placeholder="Type or paste anything that will help Flowon learn more about your business"
                className="w-full h-[calc(100vh-400px)] p-4 bg-background border border-input mb-4"
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
              />
            )}
            {selectedTab === 'files' && (
              <div 
                {...getRootProps()} 
                className={`flex flex-col items-center justify-center h-[calc(100vh-400px)] border-2 border-dashed ${isDragActive ? 'border-primary' : 'border-gray-300'} rounded-lg transition-colors duration-300 cursor-pointer`}
              >
                <input {...getInputProps()} />
                <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-gray-400'} mb-4`} />
                {selectedFile ? (
                  <div className="text-center">
                    <p className="font-semibold mb-2">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      Type: {selectedFile.type || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center">
                    {isDragActive 
                      ? "Drop the files here" 
                      : "Drag and drop files here, or click to select files"}
                  </p>
                )}
              </div>
            )}
            {selectedTab === 'web' && (
              <div className="flex flex-col h-[calc(100vh-400px)]">
                {showScrapeInput ? (
                  <>
                    <Input
                      type="url"
                      placeholder="Enter URL to scrape"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      className="mb-4"
                    />
                    <Button onClick={handleScrapeWrapper} className="self-start px-4 py-2">
                      Map Website
                    </Button>
                    {mappedUrls.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Select pages to scrape:</h3>
                        <div className="space-y-2">
                          {mappedUrls.map((url, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`url-${index}`}
                                checked={selectedUrls.includes(url)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUrls(prev => [...prev, url]);
                                  } else {
                                    setSelectedUrls(prev => prev.filter(u => u !== url));
                                  }
                                }}
                              />
                              <label htmlFor={`url-${index}`} className="text-sm truncate">
                                {url}
                              </label>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                          <p>Selected URLs: {selectedUrls.length}</p>
                          <pre>{JSON.stringify(selectedUrls, null, 2)}</pre>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button 
                            onClick={async () => {
                              const success = await handleScrapeAllWrapper();
                              if (success) {
                                setNewItemContent("URLs added to your library");
                              }
                            }}
                            disabled={selectedUrls.length === 0}
                          >
                            Scrape Selected ({selectedUrls.length})
                          </Button>
                        </div>
                      </div>
                    )}
                    {scrapeError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          {typeof scrapeError === 'string' ? scrapeError : JSON.stringify(scrapeError, null, 2)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                    All selected Urls have been added to your library
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
