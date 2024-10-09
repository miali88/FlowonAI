import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Mic,
  BookOpen,
  MessageSquare,
  Plug,
  BarChart3,
} from "lucide-react";

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
    { icon: BookOpen, label: "Knowledge Base" },
    { icon: MessageSquare, label: "Conversation Logs" },
    { icon: Plug, label: "Integrations" },
    { icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <span className="text-sm font-medium">Flowon AI</span>
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

export default Sidebar;
