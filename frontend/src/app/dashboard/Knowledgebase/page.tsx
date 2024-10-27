'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import axios from 'axios';

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  SendIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDropzone } from 'react-dropzone';
import { handleNewItem } from './HandleNewItem';
import { KnowledgeBaseTable } from './KnowledgeBaseTable'
import { handleScrape } from './HandleScrape';

import "@/components/loading.css"; // Adjust the path as necessary
import { Insert } from './Insert';

function Loader() {
  return <div className="loader"></div>;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';  // Provide default empty string

function KnowledgeBaseContent() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [newItemContent, setNewItemContent] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [selectedItem, setSelectedItem] = useState(null);
    const [setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [scrapeUrl, setScrapeUrl] = useState("");
    const [totalTokens, setTotalTokens] = useState(0);
    const [activeTab, setActiveTab] = useState('insert'); // Change initial state from 'welcome' to 'insert'
    const [scrapeError, setScrapeError] = useState("");
    const [showScrapeInput, setShowScrapeInput] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('');
  
    const fetchUserSpecificData = useCallback(async () => {
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
            tag: item.tag || "", // Add this line
            tokens: item.tokens || 0,
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
    }, [user, getToken]);
  
    useEffect(() => {
      if (user) {
        fetchUserSpecificData();
      }
    }, [user, fetchUserSpecificData]);
  
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
  
    const handleDeleteItem = async (itemId: number) => {
      if (!user) {
        setAlertMessage("User not authenticated");
        setAlertType("error");
        return;
      }
  
      try {
        const token = await getToken();
        const itemToDelete = savedItems.find(item => item.id === itemId);
        await axios.delete(`${API_BASE_URL}/dashboard/knowledge_base/${itemId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-ID': user.id,
          },
          data: {
            data_type: itemToDelete?.data_type
          }
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
  
    const handleCardClick = (tab: string) => {
      setSelectedTab(tab);
      setDialogOpen(true);
      // Remove this line to keep the welcome tab active
      // setActiveTab(tab);
    };
  
    const renderAddContent = () => {
      switch (activeTab) {
        case 'insert':
          return (
            <Insert 
              handleCardClick={handleCardClick}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              selectedTab={selectedTab}
              newItemContent={newItemContent}
              setNewItemContent={setNewItemContent}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}  // Make sure this prop is passed
              scrapeUrl={scrapeUrl}
              setScrapeUrl={setScrapeUrl}
              showScrapeInput={showScrapeInput}
              scrapeError={scrapeError}
              handleNewItemWrapper={handleNewItemWrapper}
              handleScrapeWrapper={handleScrapeWrapper}
            />
          );
        default:
          return null;
      }
    };
    
    const handleScrapeWrapper = async () => {
      const token = await getToken();
      if (!token || !user) {
        setAlertMessage("Authentication failed");
        setAlertType("error");
        return;
      }

      await handleScrape({
        scrapeUrl,
        setScrapeError,
        getToken: async () => token,
        user: { id: user.id }, // Convert to expected type
        API_BASE_URL,
        setNewItemContent,
        setShowScrapeInput,
        setScrapeUrl,
        setAlertMessage,
        setAlertType
      });
    };

    if (isLoading) {
      return <Loader />;
    }
  
    if (!user) {
      return <div>Please log in to access this content.</div>;
    }
  
    return (
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full border-b">
          <TabsList className="w-full justify-start">
          <TabsTrigger value="insert" className="text-sm">Insert</TabsTrigger>
          <TabsTrigger value="library" className="text-sm">Library</TabsTrigger>
          </TabsList>
        </Tabs>
  
        <div className="flex h-full justify-center w-full"> {/* Add justify-center and w-full */}
          {activeTab === 'insert' ? (
            renderAddContent()
          ) : activeTab === 'library' ? (
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
          ) : (
            <div className="w-full p-4">
              <div className="relative w-full mb-6">
                {renderAddContent()}
              </div>
              {activeTab !== 'welcome' && (
                <div className="flex justify-end">
                  <Button onClick={handleNewItemWrapper}>
                    <SendIcon className="h-4 w-4 mr-2" />
                    Add to Knowledge Base
                  </Button>
                </div>
              )}
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
