import axios from 'axios';
import { KnowledgeBaseItem } from './types';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface User {
  id: string;
  // Add other user properties as needed
}

interface HandleNewItemProps {
  activeAddTab: string;
  newItemContent: string;
  user: User;
  getToken: () => Promise<string>;
  handleFileUpload: () => Promise<void>;
  setSavedItems: React.Dispatch<React.SetStateAction<KnowledgeBaseItem[]>>;
  setNewItemContent: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  selectedFile: File | null;
  setDialogOpen: (open: boolean) => void;
}

export const handleNewItem = async ({
  activeAddTab,
  newItemContent,
  user,
  getToken,
  handleFileUpload,
  setSavedItems,
  setNewItemContent,
  setSelectedFile,
  selectedFile,
  setDialogOpen,
}: HandleNewItemProps) => {
  if (!user) {
    toast.error("User not authenticated");
    return;
  }

  if (activeAddTab === 'files') {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // Display file info
    const fileSize = (selectedFile.size / 1024 / 1024).toFixed(2); // Convert to MB
    toast.info(`Processing ${selectedFile.name} (${selectedFile.type}) - ${fileSize}MB`);

    try {
      await handleFileUpload();
      toast.success(`Successfully uploaded ${selectedFile.name}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to upload file: ${errorMessage}`);
    }
  } else {
    // Text content validation only for non-file uploads
    if (newItemContent.trim() === "") {
      toast.error("Cannot add empty item");
      return;
    }

    try {
      const token = await getToken();
      const requestData = {
        title: newItemContent.split('\n')[0].substring(0, 50),
        content: newItemContent,
        user_id: user.id,
      };
      console.log("Sending request data:", requestData);

      const response = await axios.post(`${API_BASE_URL}/knowledge_base/`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("Server response:", response.data);

      const newItem = response.data.data;
      setSavedItems(prevItems => [...prevItems, newItem]);
      setNewItemContent("");
      setSelectedFile(null);
      setDialogOpen(false);
      toast.success("New item added successfully");
    } catch (error: unknown) {
      console.error("Error sending data to server:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        console.error("Request config:", error.config);
        toast.error("Failed to send data to server: " + (error.response?.data?.detail || error.message));
      } else {
        toast.error("Failed to send data to server: " + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  }
};
