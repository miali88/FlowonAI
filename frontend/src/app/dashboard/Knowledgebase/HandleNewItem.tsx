import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface SavedItem {
  id: string;
  title: string;
  content: string;
  user_id: string;
  // Add other properties as needed
}

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
  setSavedItems: React.Dispatch<React.SetStateAction<SavedItem[]>>;
  setNewItemContent: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  setAlertMessage: React.Dispatch<React.SetStateAction<string>>;
  setAlertType: React.Dispatch<React.SetStateAction<string>>;
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
  setAlertType
}: HandleNewItemProps) => {
  if (activeAddTab === 'files') {
    await handleFileUpload();
  } else {
    if (newItemContent.trim() === "" || !user) {
      setAlertMessage(newItemContent.trim() === "" ? "Cannot add empty item" : "User not authenticated");
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

      const response = await axios.post(`${API_BASE_URL}/dashboard/knowledge_base`, requestData, {
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
    } catch (error) {
      console.error("Error sending data to server:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        console.error("Request config:", error.config);
      }
      setAlertMessage("Failed to send data to server: " + (error.response?.data?.detail || error.message));
      setAlertType("error");
    }
  }
};
