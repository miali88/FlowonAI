import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Mic,
  BookOpen,
  MessageSquare,
  Plug,
  BarChart3,
  Calendar,
  Menu,
  X,
  LucideIcon,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}

function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  isCollapsed,
}: {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start rounded-lg transition-colors duration-200",
              isActive ? "bg-secondary text-white" : "hover:bg-gray-700",
              isActive && "hover:bg-secondary"
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

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  setIsLoading,
}) => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("");

  const sidebarItems = [
    { icon: Compass, label: "Guided-Setup", href: "/dashboard/guided-setup" },
    { icon: Mic, label: "Agent Hub", href: "/dashboard/agenthub" },
    {
      icon: BookOpen,
      label: "Knowledge Base",
      href: "/dashboard/knowledgebase",
    },
    {
      icon: MessageSquare,
      label: "Conversation Logs",
      href: "/dashboard/conversationlogs",
    },
    { icon: Plug, label: "Integrations", href: "/dashboard/integrations" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    {
      icon: Calendar,
      label: "Contact Founders",
      href: "/dashboard/contactfounders",
    },
  ];

  const handleItemClick = (label: string, href: string) => {
    setActiveItem(label);
    setIsLoading(true);
    router.push(href);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-transparent backdrop-blur-lg border-r border-white/10 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
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
              onClick={() => handleItemClick(item.label, item.href)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};
