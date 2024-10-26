import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
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
import {
  ChevronRight,
  LogOut,
  Settings,
  Search,
} from "lucide-react";

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

function Header({ activeItem, selectedFeature }) {
  const router = useRouter();
  const { user } = useUser();
  const [userPlan] = useState("Loading...");

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
            <DropdownMenuItem onClick={() => router.push('/settings')}>
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

export default Header;
