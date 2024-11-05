'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { BackgroundPattern } from './BackgroundPattern';

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [selectedFeature] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activePanel, setActivePanel] = useState('admin');

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className={`relative flex h-screen bg-background text-foreground transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <BackgroundPattern />
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          activeItem={activeItem} 
          selectedFeature={selectedFeature} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}