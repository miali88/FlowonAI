'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import axios from 'axios';

import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  SendIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDropzone } from 'react-dropzone';
import { handleNewItem } from './HandleFile';
import { handleScrape, handleScrapeAll } from './HandleScrape';
import { Library } from './Library';

import "@/components/loading.css"; // Adjust the path as necessary
import { Insert } from './Insert';

import { KnowledgeBaseItem } from './types'

// Update the error type definitions
type ApiError = {
  message: string;
  response?: {
    data?: {
      detail?: string;
    };
  };
};

function Loader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="loader"></div>
    </div>
  );
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';  // Provide default empty string

function KnowledgeBaseContent() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [savedItems, setSavedItems] = useState<KnowledgeBaseItem[]>([]);
    const [newItemContent, setNewItemContent] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [selectedItem, setSelectedItem] = useState<KnowledgeBaseItem | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [scrapeUrl, setScrapeUrl] = useState("");
    const [totalTokens, setTotalTokens] = useState(0);
    const [activeTab, setActiveTab] = useState('insert'); // Change initial state from 'welcome' to 'insert'
    const [scrapeError, setScrapeError] = useState("");
    const [showScrapeInput, setShowScrapeInput] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('');
    const [mappedUrls, setMappedUrls] = useState<string[]>([]);
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
    const [isScrapingUrls, setIsScrapingUrls] = useState(false);
    const [isMappingWebsite, setIsMappingWebsite] = useState(false);
  
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
        const response = await axios.get(`${API_BASE_URL}/knowledge_base/knowledge_base`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-ID': user.id,
          },
        });
        console.log("API response:", response);
        
        // Update this section to handle the new response structure
        if (response.data && response.data.items) {
          console.log("Fetched items:", response.data.items);
          const formattedItems = response.data.items.map((item: {
            id: number;
            title: string;
            content: string;
            data_type: string;
            tag?: string;
            token_count?: number;
            url_tokens?: number;
            created_at?: string;
            root_url?: string;
          }) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            data_type: item.data_type,
            tag: item.tag || "",
            tokens: item.token_count || 0,
            url_tokens: item.url_tokens || 0,
            created_at: item.created_at || new Date().toISOString(),
            root_url: item.data_type === 'web' ? item.root_url : undefined,
          }));
          
          // Use the total_tokens directly from the response
          setTotalTokens(response.data.total_tokens);
          setSavedItems(formattedItems);
          
          // Log each item's title and data_type
          formattedItems.forEach((item: KnowledgeBaseItem, index: number) => {
            console.log(`Item ${index}:`, {
              title: item.title,
              data_type: item.data_type,
              tokens: item.tokens,
              url_tokens: item.url_tokens
            });
          });
        } else {
          console.error("Unexpected response structure:", response.data);
          setAlertMessage("Unexpected data structure received from server");
          setAlertType("error");
        }
      } catch (error: unknown) {
        const apiError = error as ApiError;
        console.error("Error fetching user data:", apiError);
        setAlertMessage("Failed to fetch user data: " + (apiError.message || "Unknown error"));
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
  
        const response = await axios.post(`${API_BASE_URL}/knowledge_base/upload_file`, formData, {
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
      } catch (error: unknown) {
        const apiError = error as ApiError;
        console.error("Error uploading file:", apiError);
        setAlertMessage("Failed to upload and process file: " + (apiError.response?.data?.detail || apiError.message));
        setAlertType("error");
      }
    };
  
    // Replace the existing handleNewItem function with this:
    const handleNewItemWrapper = async () => {
      const token = await getToken();
      if (!token || !user) return;  // Early return if no token or user
      
      await handleNewItem({
        activeAddTab: selectedTab,
        newItemContent,
        user: { id: user.id },
        getToken: async () => token,
        handleFileUpload,
        setSavedItems,
        setNewItemContent,
        setSelectedFile,
        setAlertMessage,
        setAlertType,
        selectedFile
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
        await axios.delete(`${API_BASE_URL}/knowledge_base/knowledge_base/${itemId}`, {
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
      } catch (error: unknown) {
        const apiError = error as ApiError;
        console.error("Error deleting item:", apiError);
        setAlertMessage("Failed to delete item: " + (apiError.message || "Unknown error"));
        setAlertType("error");
      }
    };
  
    // Replace the useDropzone section with this:
    useDropzone({ 
      onDrop: (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles[0]) {
          setSelectedFile(acceptedFiles[0]);
        }
      } 
    });
  
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
              setSelectedFile={setSelectedFile}
              scrapeUrl={scrapeUrl}
              setScrapeUrl={setScrapeUrl}
              showScrapeInput={showScrapeInput}
              scrapeError={scrapeError}
              handleNewItemWrapper={handleNewItemWrapper}
              handleScrapeWrapper={handleScrapeWrapper}
              mappedUrls={mappedUrls}
              setMappedUrls={setMappedUrls}
              selectedUrls={selectedUrls}
              setSelectedUrls={setSelectedUrls}
              handleScrapeAllWrapper={handleScrapeAllWrapper}
              isScrapingUrls={isScrapingUrls}
              isMappingWebsite={isMappingWebsite}
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

      setIsMappingWebsite(true);
      try {
        await handleScrape({
          scrapeUrl,
          setScrapeError,
          getToken: async () => token,
          user: { id: user.id },
          API_BASE_URL,
          setNewItemContent,
          setShowScrapeInput,
          setScrapeUrl,
          setAlertMessage,
          setAlertType,
          setMappedUrls,
          selectedUrls
        });
      } finally {
        setIsMappingWebsite(false);
      }
    };

    const handleScrapeAllWrapper = async () => {
      const token = await getToken();
      if (!token || !user) {
        setAlertMessage("Authentication failed");
        setAlertType("error");
        return;
      }

      setIsScrapingUrls(true);
      try {
        await handleScrapeAll({
          setScrapeError,
          getToken: async () => token,
          user: { id: user.id },
          API_BASE_URL,
          setNewItemContent,
          setShowScrapeInput,
          setScrapeUrl,
          setAlertMessage,
          setAlertType,
          selectedUrls
        });
        return true;
      } finally {
        setIsScrapingUrls(false);
      }
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

        <div className="flex h-full justify-center w-full">
          {activeTab === 'insert' ? (
            renderAddContent()
          ) : activeTab === 'library' ? (
            <Library
              savedItems={savedItems}
              totalTokens={totalTokens}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              setNewItemContent={setNewItemContent}
              handleDeleteItem={handleDeleteItem}
            />
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
