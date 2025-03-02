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
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
      title: "Conversation Logs",
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
    </Sidebar>
  );
}
