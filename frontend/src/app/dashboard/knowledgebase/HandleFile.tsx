import axios from 'axios';
import { KnowledgeBaseItem } from './types';

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
  setAlertMessage: React.Dispatch<React.SetStateAction<string>>;
  setAlertType: React.Dispatch<React.SetStateAction<string>>;
  selectedFile: File | null;
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
  setAlertMessage,
  setAlertType,
  selectedFile
}: HandleNewItemProps) => {
  if (!user) {
    setAlertMessage("User not authenticated");
    setAlertType("error");
    return;
  }

  if (activeAddTab === 'files') {
    if (!selectedFile) {
      setAlertMessage("Please select a file to upload");
      setAlertType("error");
      return;
    }

    // Display file info
    const fileSize = (selectedFile.size / 1024 / 1024).toFixed(2); // Convert to MB
    setAlertMessage(`Processing ${selectedFile.name} (${selectedFile.type}) - ${fileSize}MB`);
    setAlertType("info");

    try {
      await handleFileUpload();
      setAlertMessage(`Successfully uploaded ${selectedFile.name}`);
      setAlertType("success");
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlertMessage(`Failed to upload file: ${errorMessage}`);
      setAlertType("error");
    }
  } else {
    // Text content validation only for non-file uploads
    if (newItemContent.trim() === "") {
      setAlertMessage("Cannot add empty item");
      setAlertType("error");
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
      setAlertMessage("New item added successfully");
      setAlertType("success");
    } catch (error: unknown) {
      console.error("Error sending data to server:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        console.error("Request config:", error.config);
        setAlertMessage("Failed to send data to server: " + (error.response?.data?.detail || error.message));
      } else {
        setAlertMessage("Failed to send data to server: " + (error instanceof Error ? error.message : 'Unknown error'));
      }
      setAlertType("error");
    }
  }
};
