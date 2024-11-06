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
  BookOpen,
  ChevronRight,
  LogOut,
  BarChart3,
  Menu,
  MessageSquare,
  Mic,
  Search,
  Settings,
  X,
  Plug,
  Calendar,
} from "lucide-react";
import ChatHistory from '@/app/dashboard/ConversationLogs/page';

import KnowledgeBaseContent from "./Knowledgebase/page";
import Lab from '@/app/dashboard/AgentHub/page';  // Add this import
import IntegrationsPage from "@/app/dashboard/Integrations/page";
import DashboardContent from "@/app/dashboard/DashboardContent"; // Add this import
import { BackgroundPattern } from "@/app/dashboard/BackgroundPattern";
import ContactFounders from "@/app/dashboard/ContactFounders/page";
import Analytics from '@/app/dashboard/analytics/page';

// Add this interface at the top of your file 
// interface SavedItem {
//   id: number;
//   title: string;
//   content: string;
//   data_type: string;
//   meep: string
//   // Add other properties as needed
// }

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

function Sidebar({ isCollapsed, setIsCollapsed, activeItem, setActiveItem }) {
  const sidebarItems = [
    { icon: Mic, label: "Agent Hub" },
    { icon: BookOpen, label: "Knowledge Base" },
    { icon: MessageSquare, label: "Conversation Logs" },
    { icon: Plug, label: "Integrations" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Calendar, label: "Contact Founders" },

  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <span className="text-sm font-medium">Flowon AI (beta)</span>
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

function Header({ activeItem, selectedFeature }) {
  const { user } = useUser();
  const [userPlan] = useState("Pro");
  
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
            <DropdownMenuItem onClick={() => {
              // Move navigation logic to parent component
              window.location.href = '/settings';
            }}>
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Agent Hub");
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activePanel, setActivePanel] = useState('admin');
  
  const handleSetActiveItem = (item: string) => {
    setActiveItem(item);
    setSelectedFeature(null);
    // Remove the switch statement that was navigating to different URLs
  };

  // Add this function
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
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
      case "Dashboard":
        return <DashboardContent />;
      case "Knowledge Base":
        return <KnowledgeBaseContent />;
      case "Conversation Logs":
        return <ChatHistory />;
      case "Agent Hub":
        return <Lab />;
      case "Integrations":
        return <IntegrationsPage />;
      case "Contact Founders":
        return <ContactFounders />;
      case "Analytics":
        return <Analytics />;
      default:
        return <Lab />;
    }
  };

  return (
    <div className="relative flex h-screen bg-background text-foreground transition-colors duration-200">
      <BackgroundPattern />
      <div className="relative z-10 flex w-full">
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

export default HomePage;
