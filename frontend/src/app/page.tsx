'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
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
import { Playground } from "@/components/Playground";

// Add this constant at the top of your file, outside of any component
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
    { icon: Globe, label: "AI Agent" },
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
                <AvatarImage src="https://github.com/polymet-ai.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span>Admin User</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
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

  const handleNewItem = async () => {
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

      const response = await axios.post(`${API_BASE_URL}/api/v1/dashboard/knowledge_base`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("Server response:", response.data);

      const newItem = response.data.data; // Assuming the server returns the newly created item
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

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setScrapeError("");

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(scrapeUrl)) {
      setScrapeError("Please enter a valid URL");
      return;
    }

    try {
      const token = await getToken();
      const response = await axios.post(`${API_BASE_URL}/api/v1/dashboard/scrape_url`, 
        { url: scrapeUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-ID': user.id,
          },
        }
      );
      
      // Handle the scraped content (add it to newItemContent)
      setNewItemContent(prevContent => {
        const separator = prevContent ? '\n\n' : '';
        return prevContent + separator + response.data.content;
      });
      setShowScrapeInput(false);
      setScrapeUrl("");
      setAlertMessage("Content scraped successfully");
      setAlertType("success");
    } catch (error) {
      console.error("Error scraping URL:", error);
      setAlertMessage("Failed to scrape URL: " + (error.response?.data?.detail || error.message));
      setAlertType("error");
    }
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access this content.</div>;
  }

  return (
    <div className="flex h-full">
      {/* Left section (1/3 width) */}
      <div className="w-1/3 p-4 border-r">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Knowledge Library</h3>
          <Button size="sm" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Item
          </Button>
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
        <ScrollArea className="h-[calc(100vh-200px)]">
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
          <>
            <h3 className="text-xl font-semibold mb-4">Add to Knowledge Base</h3>
            <div className="relative w-full mb-6">
              <Textarea 
                placeholder="Type or paste anything that will help Flowon learn more about your business"
                className="w-full h-[calc(100vh-400px)] p-4 bg-background border border-input mb-4"
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowScrapeInput(!showScrapeInput)}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Scrape Web
                  </Button>
                  {selectedFile && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleNewItem}
                >
                  <SendIcon className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              {showScrapeInput && (
                <form onSubmit={handleScrape} className="mt-4 flex items-center space-x-2">
                  <Input
                    type="url"
                    placeholder="Enter URL to scrape"
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    className={scrapeError ? "border-red-500" : ""}
                  />
                  <Button type="submit">Scrape</Button>
                </form>
              )}
              {scrapeError && <p className="text-red-500 mt-2">{scrapeError}</p>}
            </div>
          </>
        )}
        {alertMessage && (
          <Alert variant={alertType === "error" ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{alertType === "error" ? "Error" : "Success"}</AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
        {user && (
          <div className="mb-4">
            <p>Welcome, {user.firstName}!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Analytics</h3>
      <p className="text-muted-foreground mb-6">
        View and analyze your data here.
      </p>
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Recent system logs and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <p className="mb-2">2023-06-15 10:30:22 - User login: admin@example.com</p>
            <p className="mb-2">2023-06-15 10:35:15 - New project created: Project X</p>
            <p className="mb-2">2023-06-15 11:02:47 - Feature update: Analytics module v2.1</p>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
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

function AIAgentNavBar({ activeTab, setActiveTab }) {
  const navItems = ["Playground", "Activity", "Analytics", "Sources", "Connect", "Settings"];

  return (
    <div className="border-b">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          {navItems.map((item) => (
            <TabsTrigger key={item.toLowerCase()} value={item.toLowerCase()} className="text-sm">
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

function AIAgentContent() {
  const [activeTab, setActiveTab] = useState('playground');

  return (
    <div className="flex flex-col h-full">
      <AIAgentNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="p-6 flex-1">
        {activeTab === 'playground' ? (
          <Playground />
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-4">AI Agent - {activeTab}</h3>
            <p className="text-muted-foreground mb-6">
              Content for {activeTab} tab.
            </p>
          </>
        )}
      </div>
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
      case "AI Agent":
        return <AIAgentContent />;
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
