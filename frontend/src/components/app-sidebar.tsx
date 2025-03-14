"use client";
import {
  Mic,
  BookOpen,
  MessageSquare,
  Plug,
  BarChart3,
  Calendar,
  ChevronLeft,
  Phone,
  Compass,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@clerk/nextjs";

// Trial status interface
interface TrialStatus {
  is_trial: boolean;
  minutes_used: number;
  minutes_total: number;
  minutes_remaining: number;
  percentage_used: number;
  remaining_days: number | null;
  trial_end_date: string | null;
  minutes_exceeded: boolean;
}

// Trial Status Component
function TrialStatus({ isCollapsed }: { isCollapsed: boolean }) {
  const [status, setStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching trial status...');
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        
        // Get authentication token from Clerk
        const token = await getToken();
        
        const response = await fetch(`${backendUrl}/user/check_trial_status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error('Trial status response not OK:', response.status);
          throw new Error('Failed to fetch trial status');
        }
        
        const data = await response.json();
        console.log('Trial status loaded:', data);
        // Log specific fields to help debug
        console.log('Minutes used:', data.minutes_used);
        console.log('Minutes total:', data.minutes_total);
        console.log('Is trial expired:', !data.remaining_days);
        setStatus(data);
      } catch (err) {
        console.error('Error fetching trial status:', err);
        setError('Could not load trial status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrialStatus();
  }, [getToken]);

  if (!status?.is_trial) return null;

  const handleUpgradeClick = () => {
    router.push('/dashboard/pricing');
  };

  // Format minutes used for display with null/undefined check
  const formatMinutesUsed = () => {
    // Check if minutes_used is defined
    if (status.minutes_used === undefined || status.minutes_used === null) {
      return ''; // Fallback value when minutes_used is not available
    }
    return `${status.minutes_used} mins remaining`;
  };

  // Format days remaining for display
  const formatDaysRemaining = () => {
    if (!status.remaining_days) return 'Expired';
    return status.remaining_days === 1 ? '1 day left' : `${status.remaining_days} days left`;
  };

  return (
    <div className={cn(
      "px-3 py-2",
      isCollapsed ? "text-center" : "",
      "relative overflow-hidden",
      "bg-gradient-to-br from-blue-50 to-blue-100/50",
      "border border-blue-200/60",
      "shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1),0_0_4px_-1px_rgba(0,0,0,0.06)]",
      "rounded-xl backdrop-blur-sm",
      "transition-all duration-200 ease-in-out",
      "hover:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.15),0_0_6px_-1px_rgba(0,0,0,0.1)]",
      "-mt-4"
    )}>
      {/* Add subtle background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.1] -z-10" />
      
      {isLoading ? (
        <div className="animate-pulse h-16 bg-blue-100/50 rounded-lg" />
      ) : error ? (
        <div className="text-red-500 flex items-center gap-1 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4" />
          <span>{!isCollapsed && error}</span>
        </div>
      ) : (
        <div className="space-y-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between text-sm font-medium text-blue-900">
              <span className="bg-blue-100/50 px-2 py-1 rounded-md">Trial Status</span>
              <span className="text-blue-600">{formatDaysRemaining()}</span>
            </div>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1.5">
                  <Progress 
                    value={status.percentage_used} 
                    className="h-2 bg-neutral-100 [&>div]:!bg-green-500" 
                  />
                  {!isCollapsed && (
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center text-green-700">
                        <Clock className="inline h-3 w-3 mr-1 text-green-500" />
                        {formatMinutesUsed()}
                      </span>
                      <span className="text-blue-500">{status.minutes_total} mins total</span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-blue-900 text-white border-blue-700">
                <p className="text-sm">{status.minutes_used} minutes used of {status.minutes_total} minutes total</p>
                <p className="text-xs text-blue-200">{formatDaysRemaining()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {!isCollapsed && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 hover:from-blue-600 hover:to-blue-700 hover:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md" 
              onClick={handleUpgradeClick}
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  setIsProgressBarLoading: (value: boolean) => void;
}

export function AppSidebar({
  isCollapsed,
  setIsCollapsed,
  setIsProgressBarLoading,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { title: "Guided Setup", icon: Compass, href: "/dashboard/guided-setup" },
    {
      title: "Call Logs",
      icon: MessageSquare,
      href: "/dashboard/conversationlogs",
    },
    { title: "Insights", icon: BarChart3, href: "/dashboard/analytics" },
    { title: "Integrations", icon: Plug, href: "/dashboard/integrations" },
    {
      title: "Knowledge Base",
      icon: BookOpen,
      href: "/dashboard/knowledgebase",
    },
    {
      title: "Contact Founders",
      icon: Calendar,
      href: "/dashboard/contactfounders",
    },
  ];

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsProgressBarLoading(true);
    router.push(href);
  };

  return (
    <Sidebar
      data-collapsed={isCollapsed}
      className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <SidebarHeader className="px-4 py-2">
        <Link href="/" className="flex flex-row items-center gap-2">
          <Image
            src="/flowon_circle.png"
            alt="Flowon Logo"
            width={24}
            height={24}
          />
          {!isCollapsed && (
            <span className="text-2xl font-semibold">Flowon</span>
          )}
        </Link>
      </SidebarHeader>

      <div className="absolute right-0 top-6 translate-x-1/2 z-10">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "h-6 w-6 rounded-full bg-secondary",
            "flex items-center justify-center",
            "hover:bg-secondary/80 transition-colors",
            "shadow-sm"
          )}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      <SidebarContent className="mt-8">
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <a
                  href={item.href}
                  onClick={(e) => handleNavigation(item.href, e)}
                  className="w-full"
                >
                  <SidebarMenuButton
                    className={cn(
                      "w-full",
                      pathname === item.href &&
                        "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </a>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Move TrialStatus outside of SidebarFooter to position it higher */}
      <div className="px-2 mb-4 mt-6">
        <TrialStatus isCollapsed={isCollapsed} />
      </div>

      <SidebarFooter className="pt-8 mt-auto">
        {/* TrialStatus component moved out */}
      </SidebarFooter>
    </Sidebar>
  );
}
