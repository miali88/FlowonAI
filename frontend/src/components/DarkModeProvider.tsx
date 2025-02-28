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
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    return null;
  }
};

const setStoredTheme = (theme: ThemeMode): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Error setting localStorage:', e);
  }
};

// Apply theme to document immediately to prevent flash
const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return;
  
  // Remove all theme classes first
  document.documentElement.classList.remove('dark', 'white');
  
  // Then add the appropriate class
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'white') {
    document.documentElement.classList.add('white');
  }
  // For 'light' mode, no class is needed as it's the default
  
  console.log(`Theme applied synchronously: ${theme}`);
};

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  // Get initial theme synchronously to prevent flash
  const initialTheme = (() => {
    const savedTheme = getStoredTheme();
    // Only use saved theme if it exists and is valid
    if (savedTheme && ['light', 'dark', 'white'].includes(savedTheme)) {
      return savedTheme;
    }
    // Default to white mode
    return 'white' as ThemeMode;
  })();

  // Apply theme synchronously on client-side
  if (typeof window !== 'undefined') {
    applyThemeToDOM(initialTheme);
  }

  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialTheme);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Calculate isDarkMode for backward compatibility
  const isDarkMode = themeMode === 'dark';

  // Initialize theme from localStorage when component mounts
  useEffect(() => {
    // We've already initialized synchronously, just mark as initialized
    setIsInitialized(true);
    console.log(`Theme initialized from storage: ${themeMode}`);
    
    // Save the default to storage if not already set
    if (!getStoredTheme()) {
      setStoredTheme(themeMode);
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    // Save to localStorage for persistence
    setStoredTheme(mode);
    // Apply theme immediately
    applyThemeToDOM(mode);
    console.log(`Theme set and saved to storage: ${mode}`);
  };

  // Keep for backward compatibility
  const toggleDarkMode = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  return (
    <ThemeModeContext.Provider value={{ themeMode, setThemeMode, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}
