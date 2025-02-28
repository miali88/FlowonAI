"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, CircleIcon, CheckIcon } from "lucide-react";
import { useThemeMode } from './DarkModeProvider';
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { themeMode, setThemeMode } = useThemeMode();

  const getThemeIcon = () => {
    switch(themeMode) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'white':
        return <CircleIcon className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={cn(
            themeMode === 'white' && "bg-white text-black border-gray-200",
            themeMode === 'dark' && "bg-black text-white border-gray-800"
          )}
        >
          {getThemeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup 
          value={themeMode} 
          onValueChange={(value) => setThemeMode(value as 'light' | 'dark' | 'white')}
        >
          <DropdownMenuRadioItem value="light" className="flex justify-between items-center">
            <div className="flex items-center">
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </div>
            {themeMode === 'light' && <CheckIcon className="h-4 w-4" />}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="flex justify-between items-center">
            <div className="flex items-center">
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </div>
            {themeMode === 'dark' && <CheckIcon className="h-4 w-4" />}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="white" className="flex justify-between items-center">
            <div className="flex items-center">
              <CircleIcon className="mr-2 h-4 w-4" />
              <span>White Mode</span>
            </div>
            {themeMode === 'white' && <CheckIcon className="h-4 w-4" />}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 