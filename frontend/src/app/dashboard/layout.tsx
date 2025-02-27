"use client";

import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import DashboardLoading from "./loading";

const layoutStyles = {
  wrapper:
    "relative flex h-screen min-h-[600px] w-full bg-background text-foreground transition-colors duration-200 overflow-hidden",
  mainContainer: "relative z-10 flex w-full min-w-0",
  mainContent:
    "flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300",
  sidebar: "w-64 border-r bg-background",
};

const ROUTE_TITLES = [
  { href: "/dashboard/guided-setup", title: "Guided Setup" },
  { href: "/dashboard/knowledgebase", title: "Knowledge Base" },
  { href: "/dashboard/conversationlogs", title: "Conversation Logs" },
  { href: "/dashboard/integrations", title: "Integrations" },
  { href: "/dashboard/analytics", title: "Analytics" },
  { href: "/dashboard/contactfounders", title: "Contact Founders" },
];

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

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

function Header({ isCollapsed, setIsCollapsed }: HeaderProps) {
  const { user } = useUser();
  const [userPlan] = useState("Pro");
  const pathname = usePathname();

  const renderTitle = () => {
    const currentRoute = ROUTE_TITLES.find((route) => route.href === pathname);
    return currentRoute?.title || "Dashboard";
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
                <AvatarImage
                  src="/assets/invert_waves.png"
                  alt="Flowon AI Logo"
                />
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
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/settings";
              }}
            >
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

function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 500); // Minimum loading time
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isProgressBarLoading) {
      const timeout = setTimeout(() => {
        setIsProgressBarLoading(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isProgressBarLoading]);

  if (!isLoaded || isLoading) {
    return (
      <div className={layoutStyles.wrapper}>
        <div className="absolute inset-0"></div>
        <div className={layoutStyles.mainContainer}>
          <div className={layoutStyles.sidebar}>
            <div className="p-4">
              <div className="h-6 w-24 bg-muted rounded animate-pulse mb-4" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={layoutStyles.mainContent}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="flex items-center space-x-4">
                <div className="h-10 w-64 bg-muted rounded animate-pulse" />
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>

            <div className="flex-1 p-6">
              <div className="h-32 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardLoading isLoading={isProgressBarLoading} />
      <div className={layoutStyles.wrapper}>
        <div className="absolute inset-0"></div>
        <div className={cn(layoutStyles.mainContainer, "relative z-10 flex")}>
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 lg:relative",
              "transition-all duration-300 ease-in-out",
              "flex",
              isMobileView && isCollapsed
                ? "-translate-x-full"
                : "translate-x-0"
            )}
          >
            <AppSidebar
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
              setIsProgressBarLoading={setIsProgressBarLoading}
            />
          </div>

          <main
            className={cn(
              layoutStyles.mainContent,
              "transition-all duration-300 ease-in-out",
              "flex-1",
              isCollapsed && "-ml-[170px]"
            )}
          >
            <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div className="flex-1 overflow-auto">
              <Suspense fallback={<DashboardLoading />}>{children}</Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
