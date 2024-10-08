'use client';

import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bell,
  BookOpen,
  ChevronRight,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  Moon,
  Search,
  Settings,
  Sun,
  X,
  Home as HomeIcon,  // Rename the Home icon import
  Beaker,
  Plug,  // Add this import
} from "lucide-react";
import ChatHistory from '@/app/dashboard/ConversationLogs/page';

import { AgentHub } from '@/app/dashboard/AgentHub/page';
import { Agent } from '@/app/dashboard/AgentHub/LibraryTable';
import KnowledgeBaseContent from "@/app/dashboard/KnowledgeBase/page";
import { DataTableDemo } from '@/app/dashboard/AgentHub/LibraryTable';  // Add this import
import { DialogDemo } from '@/app/dashboard/AgentHub/NewAgent';  // Add this import
import { AgentCards } from '@/app/dashboard/AgentHub/AgentCards';  // Add this import
import Lab from '@/app/dashboard/Lab/page';  // Add this import
import ConnectPage from "@/app/dashboard/Connect/page";

// Add this interface at the top of your file 
interface SavedItem {
  id: number;
  title: string;
  content: string;
  data_type: string;
  meep: string
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
    { icon: Mic, label: "Agent Hub" },
    { icon: Beaker, label: "Lab" },  // Moved this item here
    { icon: BookOpen, label: "Knowledge Base" },
    { icon: MessageSquare, label: "Conversation Logs" },
    { icon: Plug, label: "Connect" },
    // { icon: BarChart3, label: "Analytics" },
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

  // useEffect(() => {
  //   const fetchUserPlan = async () => {
  //     if (user) {
  //       try {
  //         const token = await getToken();
  //         const response = await axios.get(`${API_BASE_URL}/api/v1/users/data`, {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             'X-User-ID': user.id,
  //           },
  //         });
  //         setUserPlan(response.data.plan);
  //       } catch (error) {
  //         console.error("Error fetching user plan:", error);
  //         setUserPlan("Error");
  //       }
  //     }
  //   };

  //   fetchUserPlan();
  // }, [user, getToken]);

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
        {/* <Button variant="outline" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button> */}
        {/* <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button> */}
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

function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeItem, setActiveItem] = useState("Agent Hub");
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);  // Changed to false
  const [activePanel, setActivePanel] = useState('admin');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null); // State for selected agent

  const handleSetActiveItem = (item: string) => {
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
      case "Agent Hub":
        return (
          <div className="flex flex-col h-full">
            <div className="mb-4 ml-8 mt-8">
              <DialogDemo />
            </div>
            <AgentHub selectedAgent={selectedAgent} />
            <AgentCards setSelectedAgent={setSelectedAgent} />
            <div className="mt-auto flex justify-start pl-8 pb-8">
              {/* Additional content if needed */}
            </div>
          </div>
        );
      case "Knowledge Base":
        return <KnowledgeBaseContent />;
      case "Conversation Logs":
        return <ChatHistory />;
      case "Lab":
        return <Lab />;
      case "Connect":
        return <ConnectPage />;
      default:
        return (
          <div className="flex flex-col h-full">
            <div className="mb-4 ml-8 mt-8">
              <DialogDemo />
            </div>
            <AgentHub selectedAgent={selectedAgent} />
            <DataTableDemo setSelectedAgent={setSelectedAgent} />
            <div className="mt-auto flex justify-start pl-8 pb-8">
              {/* Additional content if needed */}
            </div>
          </div>
        );
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

// Rename this function to avoid conflict
function HomePage() {
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

export default HomePage;  // Export the renamed function