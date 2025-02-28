'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { BackgroundPattern } from './BackgroundPattern';
import { useThemeMode } from '@/components/DarkModeProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [selectedFeature] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { themeMode } = useThemeMode();

  return (
    <div className={`relative flex h-screen bg-background text-foreground transition-colors duration-200 ${themeMode === 'dark' ? 'dark' : themeMode === 'white' ? 'white' : ''}`}>
      <BackgroundPattern />
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        setIsLoading={setIsLoading}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          activeItem={activeItem} 
          selectedFeature={selectedFeature}
        />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}