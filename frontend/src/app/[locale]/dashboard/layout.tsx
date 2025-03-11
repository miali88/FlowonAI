"use client";

import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "../../i18n/navigation.js";
import { usePathname } from "next/navigation";
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
import { ChevronRight, LogOut, Menu, Search, Settings } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardLoading from "../../../app/dashboard/loading";

const layoutStyles = {
  wrapper:
    "relative flex h-screen min-h-[600px] w-full bg-background text-foreground transition-colors duration-200 overflow-hidden",
  mainContainer: "relative z-10 flex w-full min-w-0",
  mainContent:
    "flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300",
  sidebar: "w-64 border-r bg-background",
  mainContentInner: "flex-1 overflow-y-auto p-0 scrollbar-thin",
  mainContentInnerWithBackgroundPattern:
    "flex-1 overflow-y-auto p-0 scrollbar-thin bg-[#fbfbfb] dark:bg-background",
  headerWithSidebar: "h-14 border-b bg-background px-6 flex items-center",
  headerWithSidebarCollapsed:
    "h-14 border-b bg-background px-2 flex items-center",
  menuButton: "h-8 w-8 flex items-center justify-center",
  searchBar:
    "flex items-center transition-colors border border-gray-200 ml-4 rounded-lg px-3 h-8 w-72 max-w-full bg-muted/30 hover:bg-muted/50",
  searchIconContainer: "flex items-center text-gray-500",
  searchInput:
    "bg-transparent border-none p-0 pl-2 text-sm focus-visible:outline-none focus-visible:ring-0 flex-1",
};

function LogoutMenuItem() {
  const { signOut } = useClerk();

  const handleLogout = () => {
    signOut();
  };

  return (
    <DropdownMenuItem
      onClick={handleLogout}
      className="text-destructive focus:text-destructive"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </DropdownMenuItem>
  );
}

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

function Header({ isCollapsed, setIsCollapsed }: HeaderProps) {
  const { user } = useUser();

  const renderTitle = () => {
    if (user?.organizationMemberships?.[0]) {
      const organizationName =
        user.organizationMemberships[0].organization.name;
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{organizationName}</span>
          <Badge
            variant="secondary"
            className="text-[10px] px-1 py-0 h-4 bg-blue-100 text-blue-600 border-blue-200"
          >
            Free Plan
          </Badge>
        </div>
      );
    }
    return <span className="font-semibold">Dashboard</span>;
  };

  return (
    <header
      className={
        isCollapsed
          ? layoutStyles.headerWithSidebarCollapsed
          : layoutStyles.headerWithSidebar
      }
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={layoutStyles.menuButton}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className={layoutStyles.searchBar}>
        <div className={layoutStyles.searchIconContainer}>
          <Search className="h-4 w-4" />
        </div>
        <Input
          className={layoutStyles.searchInput}
          placeholder="Search..."
          type="search"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        {renderTitle()}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center focus-visible:outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} alt={user?.username || ""} />
                <AvatarFallback>
                  {user?.firstName?.[0] || user?.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ""}`
                : user?.username || "User"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <LogoutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProgressBarLoading, setIsProgressBarLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  // Loading state
  if (isLoading || !isLoaded) {
    return <DashboardLoading />;
  }

  if (!userId) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className={layoutStyles.wrapper}>
        <div className={layoutStyles.mainContainer}>
          <AppSidebar 
            isCollapsed={isCollapsed} 
            setIsCollapsed={setIsCollapsed}
            setIsProgressBarLoading={setIsProgressBarLoading}
          />

          <div className={layoutStyles.mainContent}>
            <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={layoutStyles.mainContentInner}>
              <Suspense fallback={<DashboardLoading />}>{children}</Suspense>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
} 