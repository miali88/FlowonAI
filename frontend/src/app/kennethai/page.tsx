'use client';

import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import ChatAgent from '@/components/dashboard/ChatAgent';
import { Badge } from "@/components/ui/badge";
import ChatHistory from '@/components/dashboard/ChatHistory';
import ContactUs from '@/components/dashboard/ContactUs';
import { Progress } from "@/components/ui/progress";
import HowKenneth from '@/components/HowKenneth';
import KnowledgeBaseContent from '@/app/dashboard/knowledgebase/page';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
//console.log('API_BASE_URL:', API_BASE_URL);

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
    { icon: Globe, label: "Kenneth AI" },
    { icon: MessageSquare, label: "Chat History" },
    { icon: BookOpen, label: "Knowledge Base" },
    { icon: AlertCircle, label: "How Kenneth Works" },
    { icon: User, label: "Contact Us" },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <span className="text-sm font-medium">Admin Panel</span>
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

function LogoutMenuItem() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = () => {
    signOut(() => router.push("/"));
  };

  return (
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </DropdownMenuItem>
  );
}

function Header({ activeItem, selectedFeature, isDarkMode, toggleDarkMode }) {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [userPlan, setUserPlan] = useState("Loading...");

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user) {
        try {
          const token = await getToken();
          const response = await axios.get(`${API_BASE_URL}/users/clerk`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              user_id: user.id,
            },
          });
          setUserPlan(response.data.plan);
        } catch (error) {
          console.error("Error fetching user plan:", error);
          setUserPlan("Error");
        }
      }
    };

    fetchUserPlan();
  }, [user, getToken]);

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
              <Badge variant="outline" className="ml-2">
                {userPlan}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Kenneth AI (beta)");
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
      case "Kenneth AI":
        return <ChatAgent />;
      case "Chat History":
        return <ChatHistory />;
      case "Knowledge Base":
        return <KnowledgeBaseContent />;
      case "How Kenneth Works":
        return <HowKenneth />;
      case "Contact Us":
        return <ContactUs />;
      default:
        return <ChatAgent />;
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