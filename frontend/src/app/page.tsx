'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  ChevronRight,
  Edit,
  Globe,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  Moon,
  PlusCircle,
  Search,
  SendIcon,
  Settings,
  Sun,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDropzone } from 'react-dropzone';
import { LiveKitEntry } from "@/components/LiveKitEntry";
import ChatAgent from '@/components/Dashboard/ChatAgent';
import { Analytics } from "@/components/Dashboard/Analytics";
import { handleNewItem } from '@/components/Dashboard/Knowledgebase/HandleNewItem';
import { handleScrape } from '@/components/Dashboard/Knowledgebase/HandleScrape';

const API_BASE_URL = 'http://localhost:8000';

// Add this interface at the top of your file
interface SavedItem {
  id: number;
  title: string;
  content: string;
  // Add other properties as needed
}

function SidebarItem({ icon: Icon, label, isActive, onClick, isCollapsed }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isActive && "bg-secondary"
            )}
            onClick={onClick}
          >
            <Icon className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">{label}</span>}
          </Button>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

function Sidebar({ isCollapsed, setIsCollapsed, activeItem, setActiveItem, activePanel, setActivePanel }) {
  const sidebarItems = [
    { icon: BookOpen, label: "Knowledge Base" },
    { icon: Mic, label: "Voice Agent" },
    { icon: Globe, label: "Chat Agent" },
    { icon: MessageSquare, label: "Features" },
    { icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <Button variant="ghost" onClick={() => setActivePanel(activePanel === 'admin' ? 'items' : 'admin')}>
            {activePanel === 'admin' ? 'Admin Panel' : 'Items'}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu /> : <X />}
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-2">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activeItem === item.label}
              onClick={() => setActiveItem(item.label)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

function Header({ activeItem, selectedFeature, isDarkMode, toggleDarkMode }) {
  const router = useRouter();
  const { user } = useUser();

  const renderTitle = () => {
    if (selectedFeature) {
      return (
        <div className="flex items-center">
          <span>Features</span>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>{selectedFeature}</span>
        </div>
      );
    }
    return activeItem;
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold">{renderTitle()}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8 w-64" />
        </div>
        <Button variant="outline" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/assets/invert_waves.png" alt="Flowon AI Logo" />
                <AvatarFallback>FA</AvatarFallback>
              </Avatar>
              <span>{user?.fullName || "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

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
  const [activeAddTab, setActiveAddTab] = useState('text');

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
      const response = await axios.get(`${API_BASE_URL}/api/v1/dashboard/knowledge_base`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-ID': user.id,
        },
      });
      console.log("Fetched items:", response.data);
      console.log("API response:", response);
      console.log("Response data type:", typeof response.data);
      console.log("Is response.data an array?", Array.isArray(response.data));
      
      // Ensure savedItems is always an array
      setSavedItems(Array.isArray(response.data) ? response.data : []);

      // Calculate total tokens
      const aggregatedContent = response.data.map(item => item.content).join(' ');
      const tokenCountResponse = await axios.post(`${API_BASE_URL}/api/v1/dashboard/calculate_tokens`, 
        { content: aggregatedContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-ID': user.id,
          },
        }
      );
      setTotalTokens(tokenCountResponse.data.token_count);
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

      const response = await axios.post(`${API_BASE_URL}/api/v1/dashboard/upload_file`, formData, {
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
      await axios.delete(`${API_BASE_URL}/api/v1/dashboard/knowledge_base/${itemId}`, {
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
          <TabsTrigger value="add" className="text-sm">Add to Library</TabsTrigger>
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
                <p>Total Tokens: {totalTokens}</p>
              </div>
              <ScrollArea className="h-[calc(100vh-300px)]">
                {filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className={cn(
                      "mb-2 cursor-pointer relative group",
                      selectedItem?.id === item.id && "bg-secondary"
                    )}
                    onClick={() => { setSelectedItem(item); setIsEditing(false); }}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{item.title}</CardTitle>
                    </CardHeader>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </Card>
                ))}
              </ScrollArea>
            </div>

            {/* Right section (2/3 width) */}
            <div className="w-2/3 p-4">
              {selectedItem ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{selectedItem.title}</h3>
                    <Button onClick={handleEditItem} disabled={isEditing}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
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
            <Tabs value={activeAddTab} onValueChange={setActiveAddTab} className="w-full mb-4">
              <TabsList>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="web">Web</TabsTrigger>
                <TabsTrigger value="connect">Connect</TabsTrigger>
                <TabsTrigger value="codebase">Codebase</TabsTrigger>
              </TabsList>
            </Tabs>
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

function AnalyticsContent() {
  return <Analytics />;
}

function FeaturesContent({ setSelectedFeature }) {
  const features = [
    { title: "Call Routing", description: "Efficiently route incoming calls to the right department or agent.", icon: MessageSquare },
    { title: "Appointment Booking", description: "Allow customers to book appointments directly through your system.", icon: MessageSquare },
    { title: "Prospecting", description: "Identify and engage potential customers to grow your business.", icon: MessageSquare },
    { title: "Interview", description: "Streamline your hiring process with integrated interview scheduling and management.", icon: MessageSquare },
    { title: "Customer Support", description: "Provide excellent customer support with our integrated tools.", icon: MessageSquare },
  ];

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Features</h3>
      <p className="text-muted-foreground mb-6">
        Explore and manage the features available in your admin panel.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <feature.icon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
              <Button 
                className="mt-4 w-8 h-8 rounded-full p-0" 
                onClick={() => setSelectedFeature(feature.title)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FeatureDetailContent({ feature }) {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">{feature}</h3>
      <p className="text-muted-foreground mb-6">
        Detailed settings and information for {feature}.
      </p>
    </div>
  );
}

function VoiceAgentContent() {
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);

  const toggleLiveKit = () => {
    setIsLiveKitActive(!isLiveKitActive);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden">
      <h3 className="text-xl font-semibold mb-4">Voice Agent</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-2xl">
        Experience our Voice Agent feature. Click the button below to start a conversation with our AI assistant.
      </p>
      <Button onClick={toggleLiveKit}>
        {isLiveKitActive ? "Stop Voice Agent" : "Start Voice Agent"}
      </Button>
      {isLiveKitActive && (
        <div className="mt-6 w-full max-w-md">
          <LiveKitEntry />
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Voice agent is active. Speak into your microphone to interact with the AI.
          </p>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeItem, setActiveItem] = useState("Knowledge Base");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activePanel, setActivePanel] = useState('admin');

  const handleSetActiveItem = (item) => {
    setActiveItem(item);
    setSelectedFeature(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.style.setProperty('--background', '#000134');
      document.documentElement.style.setProperty('--foreground', '#ffffff');
    } else {
      document.documentElement.style.removeProperty('--background');
      document.documentElement.style.removeProperty('--foreground');
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (activeItem) {
      case "Knowledge Base":
        return <KnowledgeBaseContent />;
      case "Voice Agent":
        return <VoiceAgentContent />;
      case "Chat Agent":
        return <ChatAgent />;
      case "Features":
        return selectedFeature ? 
          <FeatureDetailContent feature={selectedFeature} /> : 
          <FeaturesContent setSelectedFeature={setSelectedFeature} />;
      case "Analytics":
        return <AnalyticsContent />;
      default:
        return <KnowledgeBaseContent />;
    }
  };

  return (
    <div className={`flex h-screen bg-background text-foreground transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        activeItem={activeItem}
        setActiveItem={handleSetActiveItem}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          activeItem={activeItem} 
          selectedFeature={selectedFeature} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <AdminDashboard />;
}
