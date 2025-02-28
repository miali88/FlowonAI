"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'dark' | 'light' | 'white';

const ThemeModeContext = createContext<{
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean; // Keep for backward compatibility
  toggleDarkMode: () => void; // Keep for backward compatibility
}>({ 
  themeMode: 'white', // Set default to white 
  setThemeMode: () => {}, 
  isDarkMode: false, 
  toggleDarkMode: () => {} 
});

export const useThemeMode = () => useContext(ThemeModeContext);
export const useDarkMode = () => { 
  // Backward compatibility hook
  const { isDarkMode, toggleDarkMode } = useContext(ThemeModeContext);
  return { isDarkMode, toggleDarkMode };
};

const THEME_STORAGE_KEY = 'flowon-theme-mode';

// Helper to safely access localStorage (avoids SSR issues)
const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
};

const setStoredTheme = (theme: ThemeMode): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('white');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Calculate isDarkMode for backward compatibility
  const isDarkMode = themeMode === 'dark';

  // Initialize theme from localStorage when component mounts
  useEffect(() => {
    const savedTheme = getStoredTheme();
    
    // Only apply a saved theme if it exists and is a valid option
    if (savedTheme && ['light', 'dark', 'white'].includes(savedTheme)) {
      setThemeModeState(savedTheme);
    } else {
      // Default to white mode if no saved preference
      setThemeModeState('white');
      // Save the default to storage
      setStoredTheme('white');
    }
    
    setIsInitialized(true);
    console.log(`Theme initialized from storage: ${savedTheme || 'white (default)'}`);
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    // Save to localStorage for persistence
    setStoredTheme(mode);
    console.log(`Theme set and saved to storage: ${mode}`);
  };

  // Keep for backward compatibility
  const toggleDarkMode = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  useEffect(() => {
    // Only apply theme changes after initialization
    if (!isInitialized) return;
    
    // Remove all theme classes first
    document.documentElement.classList.remove('dark', 'white');
    
    // Then add the appropriate class
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (themeMode === 'white') {
      document.documentElement.classList.add('white');
    }
    // For 'light' mode, no class is needed as it's the default
    
    console.log(`Theme changed to: ${themeMode}`);
  }, [themeMode, isInitialized]);

  return (
    <ThemeModeContext.Provider value={{ themeMode, setThemeMode, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}
