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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import ChatHistory from '@/app/dashboard/conversationlogs/page';

import KnowledgeBaseContent from "./knowledgebase/page";
import AgentHub from '@/app/dashboard/agenthub/page';  // Add this import
import IntegrationsPage from "@/app/dashboard/integrations/page";
import ContactFounders from "@/app/dashboard/contactfounders/page";
import Analytics from '@/app/dashboard/analytics/page';
//import { Sidebar } from './Sidebar';
//console.log(Sidebar); // Should log a function or class, not an object

// Add this interface at the top of your file 
// interface SavedItem {
//   id: number;
//   title: string;
//   content: string;
//   data_type: string;
//   meep: string
//   // Add other properties as needed
// }

// Add this import at the top
import { AppSidebar } from "@/components/app-sidebar";

// Add this import near the top with other page imports
import PhoneNumbersPage from '@/app/dashboard/phonenumbers/page';

// Add this CSS at the top of your file after imports
const layoutStyles = {
  wrapper: "relative flex h-screen min-h-[600px] w-full bg-background text-foreground transition-colors duration-200 overflow-hidden",
  mainContainer: "relative z-10 flex w-full min-w-0",
  mainContent: "flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300",
  sidebar: "w-64 border-r bg-background",
};

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

// Add this interface before the Header function
interface HeaderProps {
  activeItem: string;
  selectedFeature: string | null;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

function Header({ activeItem, selectedFeature, isCollapsed, setIsCollapsed }: HeaderProps) {
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
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">{renderTitle()}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8 w-64" />
        </div>
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
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Agent Hub");
  const [selectedFeature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  //useEffect(() => {
    // Redirect to /dashboard/agenthub on mount
    //router.push("/dashboard/agenthub");
  //}, [router]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024); // 1024px is the lg breakpoint
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log('isCollapsed changed to:', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    // Simulate data fetching or other async operations
    const fetchData = async () => {
      // Perform any necessary operations
      // ...

      // Set isLoading to false once operations are complete
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={layoutStyles.wrapper}>
        <div className="absolute inset-0">
        </div>
        <div className={layoutStyles.mainContainer}>
          {/* Skeleton sidebar with fixed width */}
          <div className={layoutStyles.sidebar}>
            <div className="p-4">
              <div className="h-6 w-24 bg-muted rounded animate-pulse mb-4" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Skeleton main content */}
          <div className={layoutStyles.mainContent}>
            {/* Skeleton header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="flex items-center space-x-4">
                <div className="h-10 w-64 bg-muted rounded animate-pulse" />
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
            
            {/* Skeleton content */}
            <div className="flex-1 p-6">
              <div className="h-32 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeItem) {
      case "Knowledge Base":
        return <KnowledgeBaseContent />;
      case "Conversation Logs":
        return <ChatHistory />;
      case "Agent Hub":
        return <AgentHub />;
      case "Integrations":
        return <IntegrationsPage />;
      case "Contact Founders":
        return <ContactFounders />;
      case "Analytics":
        return <Analytics />;
      case "Phone Numbers":
        return <PhoneNumbersPage />;
      default:
        return <AgentHub />;
    }
  };

  return (
    <div className={layoutStyles.wrapper}>
      {/* Background elements */}
      <div className="absolute inset-0">
      </div>

      {/* Main content container */}
      <div className={cn(
        layoutStyles.mainContainer,
        "relative z-10 flex" // Add relative and z-10 to keep content above particles
      )}>
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative",
          "transition-all duration-300 ease-in-out",
          "flex",
          isMobileView && isCollapsed ? "-translate-x-full" : "translate-x-0"
        )}>
          <AppSidebar 
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>

        {/* Main Content */}
        <main className={cn(
          layoutStyles.mainContent,
          "transition-all duration-300 ease-in-out",
          "flex-1",
          isCollapsed && "-ml-[170px]"
        )}>
          <Header 
            activeItem={activeItem} 
            selectedFeature={selectedFeature}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
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
