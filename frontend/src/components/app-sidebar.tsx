import { Mic, BookOpen, MessageSquare, Plug, BarChart3, Calendar, ChevronLeft, Phone, PhoneOutgoing } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";
import Image from 'next/image';
import Link from 'next/link';

interface AppSidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  onAgentHubClick?: () => void;
}

export function AppSidebar({ 
  activeItem, 
  setActiveItem, 
  isCollapsed, 
  setIsCollapsed,
  onAgentHubClick
}: AppSidebarProps) {
  const items = [
    { title: "Agent Hub", icon: Mic },
    { title: "Phone Numbers", icon: Phone },
    { title: "Knowledge Base", icon: BookOpen },
    { title: "Conversation Logs", icon: MessageSquare },
    { title: "Integrations", icon: Plug },
    { title: "Analytics", icon: BarChart3 },
    { title: "Contact Founders", icon: Calendar },
  ];

  const handleItemClick = (title: string) => {
    setActiveItem(title);
    if (title === "Agent Hub" && onAgentHubClick) {
      onAgentHubClick();
    }
  };

  return (
    <Sidebar 
      collapsed={isCollapsed}
      className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <SidebarHeader className="px-4 py-2">
        <Link href="/" className="flex flex-row items-center gap-2">
          <Image 
            src="/flowon_partial.png" 
            alt="Flowon Logo" 
            width={24} 
            height={24} 
            className="invert"
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
                <SidebarMenuButton
                  onClick={() => handleItemClick(item.title)}
                  className={cn(
                    "w-full",
                    activeItem === item.title && "bg-secondary text-secondary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.title}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
