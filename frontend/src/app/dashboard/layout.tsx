"use client";

import { useUser, useAuth, UserButton, SignedIn } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Search } from "lucide-react";
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
  { href: "/dashboard/campaigns", title: "Campaigns" },
  { href: "/dashboard/knowledgebase", title: "Knowledge Base" },
  { href: "/dashboard/conversationlogs", title: "Conversation Logs" },
  { href: "/dashboard/integrations", title: "Integrations" },
  { href: "/dashboard/analytics", title: "Analytics" },
  { href: "/dashboard/contactfounders", title: "Contact Founders" },
];

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

function Header({ isCollapsed, setIsCollapsed }: HeaderProps) {
  const pathname = usePathname();

  const renderTitle = () => {
     // Check if we're in a campaign detail page
     if (pathname?.startsWith("/dashboard/campaigns/")) {
      return "Campaigns";
    }
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
        <div className="flex items-center gap-2">
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProgressBarLoading, setIsProgressBarLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    if (isLoaded && !userId) {
      console.log("User not authenticated, redirecting to sign-in");
      router.replace("/sign-in");
      return;
    }
    setIsLoading(false);
  }, [isLoaded, userId, router]);

  // Add effect to reset loading state when navigation completes
  useEffect(() => {
    // When pathname changes, it means navigation has completed
    if (isProgressBarLoading) {
      console.log("Navigation completed, resetting loading state");
      setIsProgressBarLoading(false);
    }
  }, [pathname, isProgressBarLoading]);

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

  // Show loading state while checking authentication or during initial load
  if (!isLoaded || isLoading) {
    return <DashboardLoading />;
  }

  // If we're loaded but there's no user, don't render anything
  if (isLoaded && !userId) {
    return null;
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
