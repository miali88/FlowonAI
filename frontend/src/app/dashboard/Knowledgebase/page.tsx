'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import axios from 'axios';

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Edit,
  Globe,
  SendIcon,
  Trash2,
  Upload,
  Home as HomeIcon,  // Rename the Home icon import
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDropzone } from 'react-dropzone';
import { handleNewItem } from './HandleNewItem';
import { handleScrape } from './HandleScrape';
import { TokenCounter } from './TokenCounter';
interface SavedItem {
  id: number;
  title: string;
  content: string;
  data_type: string;
  // Add other properties as needed
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function KnowledgeBaseContent() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [newItemContent, setNewItemContent] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showScrapeInput, setShowScrapeInput] = useState(false);
    const [scrapeUrl, setScrapeUrl] = useState("");
    const [scrapeError, setScrapeError] = useState("");
    const [totalTokens, setTotalTokens] = useState(0);
    const [activeTab, setActiveTab] = useState('library');
  
    useEffect(() => {
      if (user) {
        fetchUserSpecificData();
      }
    }, [user]);
  
    const fetchUserSpecificData = async () => {
      if (!user) {
        console.error("User not authenticated");
        setAlertMessage("User not authenticated");
        setAlertType("error");
        setIsLoading(false);
        return;
      }
  
      try {
        const token = await getToken();
        const response = await axios.get(`${API_BASE_URL}/dashboard/knowledge_base`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-ID': user.id,
          },
        });
        console.log("API response:", response);
        
        if (response.data && Array.isArray(response.data)) {
          console.log("Fetched items:", response.data);
          const formattedItems = response.data.map(item => ({
            id: item.id,
            title: item.title,
            content: item.content || "Content not available",
            data_type: item.data_type,
            tokens: item.tokens || 0, // Add this line
          }));
          
          // Calculate total tokens
          const total = formattedItems.reduce((sum, item) => sum + (item.tokens || 0), 0);
          setTotalTokens(total);
          setSavedItems(formattedItems);
          
          // Log each item's title and data_type
          formattedItems.forEach((item, index) => {
            console.log(`Item ${index} title:`, item.title, `data_type:`, item.data_type);
          });

          // Note: total_tokens is not present in the current response
          // If you need to calculate total tokens, you might need to do it on the frontend
          // or request the backend to provide this information
        } else {
          console.error("Unexpected response structure:", response.data);
          setAlertMessage("Unexpected data structure received from server");
          setAlertType("error");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAlertMessage("Failed to fetch user data: " + (error.message || "Unknown error"));
        setAlertType("error");
      } finally {
        setIsLoading(false);
      }
    };
  
    // Add this new function to handle file uploads
    const handleFileUpload = async () => {
      if (!selectedFile || !user) {
        setAlertMessage(selectedFile ? "User not authenticated" : "No file selected");
        setAlertType("error");
        return;
      }
  
      try {
        const token = await getToken();
        const formData = new FormData();
        formData.append('file', selectedFile);
  
        const response = await axios.post(`${API_BASE_URL}/dashboard/upload_file`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'X-User-ID': user.id,
          },
        });
  
        console.log("Server response:", response.data);
  
        const newItem = response.data.data;
        setSavedItems(prevItems => [...prevItems, newItem]);
        setSelectedFile(null);
        setAlertMessage("File processed and added to Knowledge Base successfully");
        setAlertType("success");
      } catch (error) {
        console.error("Error uploading file:", error);
        setAlertMessage("Failed to upload and process file: " + (error.response?.data?.detail || error.message));
        setAlertType("error");
      }
    };
  
    // Replace the existing handleNewItem function with this:
    const handleNewItemWrapper = async () => {
      await handleNewItem({
        activeAddTab: activeTab,
        newItemContent,
        user,
        getToken,
        handleFileUpload,
        setSavedItems,
        setNewItemContent,
        setSelectedFile,
        setAlertMessage,
        setAlertType
      });
    };
  
    const handleEditItem = () => {
      if (selectedItem) {
        setIsEditing(true);
        setNewItemContent(selectedItem.content);
      }
    };
  
    const handleSaveEdit = () => {
      if (newItemContent.trim() === "") {
        setAlertMessage("Cannot save empty item");
        setAlertType("error");
        return;
      }
  
      const updatedItems = savedItems.map(item => 
        item.id === selectedItem.id 
          ? { ...item, content: newItemContent, title: newItemContent.split('\n')[0].substring(0, 50) }
          : item
      );
  
      setSavedItems(updatedItems);
      setSelectedItem({ ...selectedItem, content: newItemContent, title: newItemContent.split('\n')[0].substring(0, 50) });
      setIsEditing(false);
      setNewItemContent("");
      setAlertMessage("Item updated successfully");
      setAlertType("success");
    };
  
    const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
    };
  
    const handleScrapeWrapper = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleScrape({
        scrapeUrl,
        setScrapeError,
        getToken,
        user,
        API_BASE_URL,
        setNewItemContent,
        setShowScrapeInput,
        setScrapeUrl,
        setAlertMessage,
        setAlertType
      });
    };
  
    const filteredItems = savedItems.filter(item =>
      item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    useEffect(() => {
      if (alertMessage) {
        const timer = setTimeout(() => {
          setAlertMessage("");
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [alertMessage]);
  
    const handleDeleteItem = async (itemId: number) => {
      if (!user) {
        setAlertMessage("User not authenticated");
        setAlertType("error");
        return;
      }
  
      try {
        const token = await getToken();
        await axios.delete(`${API_BASE_URL}/dashboard/knowledge_base/${itemId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-ID': user.id,
          },
        });
  
        setSavedItems(prevItems => prevItems.filter(item => item.id !== itemId));
        if (selectedItem?.id === itemId) {
          setSelectedItem(null);
        }
        setAlertMessage("Item deleted successfully");
        setAlertType("success");
      } catch (error) {
        console.error("Error deleting item:", error);
        setAlertMessage("Failed to delete item: " + (error.message || "Unknown error"));
        setAlertType("error");
      }
    };
  
    const onDrop = useCallback((acceptedFiles) => {
      // Handle the dropped files here
      console.log(acceptedFiles);
      // You might want to update the state or process the files
      setSelectedFile(acceptedFiles[0]);
    }, []);
  
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  
    const renderAddContent = () => {
      switch (activeTab) {
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
              <Button onClick={handleScrapeWrapper} className="self-start px-4 py-2">
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
        default:
          return null;
      }
    };
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
  
    if (!user) {
      return <div>Please log in to access this content.</div>;
    }
  
    return (
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full border-b">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="library" className="text-sm">Library</TabsTrigger>
            <TabsTrigger value="text" className="text-sm">Text</TabsTrigger>
            <TabsTrigger value="files" className="text-sm">Files</TabsTrigger>
            <TabsTrigger value="web" className="text-sm">Web</TabsTrigger>
            <TabsTrigger value="connect" className="text-sm">Connect</TabsTrigger>
          </TabsList>
        </Tabs>
  
        <div className="flex h-full">
          {activeTab === 'library' ? (
            <>
              {/* Left section (1/3 width) */}
              <div className="w-1/3 p-4 border-r">
                <div className="flex justify-between items-center mb-4">
                </div>
                <div className="mb-4">
                  <Input 
                    placeholder="Search items..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <TokenCounter totalTokens={totalTokens} />
                </div>
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {filteredItems.map((item) => {
                    console.log(`Rendering item ${item.id} with data_type:`, item.data_type);
                    return (
                      <Card 
                        key={item.id} 
                        className={cn(
                          "mb-2 cursor-pointer",
                          selectedItem?.id === item.id && "bg-secondary"
                        )}
                        onClick={() => { setSelectedItem(item); setIsEditing(false); }}
                      >
                        <CardHeader className="p-3 flex flex-row items-center justify-between">
                          <CardTitle className="text-sm">{item.title}</CardTitle>
                          <span className="px-2 py-1 text-xs font-semibold text-white bg-cyan-800 rounded-full">
                            {item.data_type || ''}
                          </span>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </ScrollArea>
              </div>
  
              {/* Right section (2/3 width) */}
              <div className="w-2/3 p-4">
                {selectedItem ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{selectedItem.title}</h3>
                      <div className="flex space-x-2">
                        <Button onClick={handleEditItem} disabled={isEditing}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteItem(selectedItem.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                        </Button>
                      </div>
                    </div>
                    {isEditing ? (
                      <>
                        <Textarea 
                          className="w-full h-[calc(100vh-250px)] p-4 bg-background border border-input mb-4"
                          value={newItemContent}
                          onChange={(e) => setNewItemContent(e.target.value)}
                        />
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                      </>
                    ) : (
                      <ScrollArea className="h-[calc(100vh-250px)]">
                        <p className="whitespace-pre-wrap">{selectedItem.content}</p>
                      </ScrollArea>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Select an item to view or edit</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full p-4">
              <div className="relative w-full mb-6">
                {renderAddContent()}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleNewItemWrapper}>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Add to Knowledge Base
                </Button>
              </div>
            </div>
          )}
        </div>
  
        {alertMessage && (
          <Alert variant={alertType === "error" ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{alertType === "error" ? "Error" : "Success"}</AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

// Export the component
export default KnowledgeBaseContent;
