

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  User,
  X,
  PhoneCall,
  Calendar,
  Users,
  Briefcase,
  HeadphonesIcon,
  ArrowRight,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";

function SidebarItem({ icon: Icon, label, isActive, onClick }) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start",
        isActive && "bg-secondary"
      )}
      onClick={onClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

function Sidebar({ isCollapsed, setIsCollapsed, activeItem, setActiveItem }) {
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: MessageSquare, label: "Features" },
    { icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
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
              label={isCollapsed ? "" : item.label}
              isActive={activeItem === item.label}
              onClick={() => setActiveItem(item.label)}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

function Header({ activeItem, selectedFeature, isDarkMode, toggleDarkMode }) {
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
        <Button variant="outline" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/polymet-ai.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span>Admin User</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function DashboardContent() {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h3>
      <p className="text-muted-foreground mb-6">
        Here you can manage your projects, view analytics, and access various admin features.
      </p>
      {/* Add more dashboard content here */}
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Analytics</h3>
      <p className="text-muted-foreground mb-6">
        View and analyze your data here.
      </p>
      {/* Add analytics content here */}
      
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Recent system logs and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {/* Add log entries here */}
            <p className="mb-2">2023-06-15 10:30:22 - User login: admin@example.com</p>
            <p className="mb-2">2023-06-15 10:35:15 - New project created: Project X</p>
            <p className="mb-2">2023-06-15 11:02:47 - Feature update: Analytics module v2.1</p>
            {/* Add more log entries as needed */}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Add more analytics components here */}
    </div>
  );
}

function FeaturesContent({ setSelectedFeature }) {
  const features = [
    { title: "Call Routing", description: "Efficiently route incoming calls to the right department or agent.", icon: PhoneCall },
    { title: "Appointment Booking", description: "Allow customers to book appointments directly through your system.", icon: Calendar },
    { title: "Prospecting", description: "Identify and engage potential customers to grow your business.", icon: Users },
    { title: "Interview", description: "Streamline your hiring process with integrated interview scheduling and management.", icon: Briefcase },
    { title: "Customer Support", description: "Provide excellent customer support with our integrated tools.", icon: HeadphonesIcon },
  ];

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Features</h3>
      <p className="text-muted-foreground mb-6">
        Explore and manage the features available in your admin panel.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <feature.icon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
              <Button 
                className="mt-4 w-8 h-8 rounded-full p-0" 
                onClick={() => setSelectedFeature(feature.title)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FeatureDetailContent({ feature }) {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">{feature}</h3>
      <p className="text-muted-foreground mb-6">
        Detailed settings and information for {feature}.
      </p>
      {/* Add feature-specific content here */}
    </div>
  );
}

export default function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSetActiveItem = (item) => {
    setActiveItem(item);
    setSelectedFeature(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
      case "Features":
        return selectedFeature ? 
          <FeatureDetailContent feature={selectedFeature} /> : 
          <FeaturesContent setSelectedFeature={setSelectedFeature} />;
      case "Analytics":
        return <AnalyticsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className={`flex h-screen bg-background text-foreground transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        activeItem={activeItem}
        setActiveItem={handleSetActiveItem}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          activeItem={activeItem} 
          selectedFeature={selectedFeature} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <ScrollArea className="flex-1">
          {renderContent()}
        </ScrollArea>
      </main>
    </div>
  );
}

