/**
 * Theme Provider
 * Provides theme context and manages dark/light mode
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { setTheme } from '../store/slices/uiSlice';
import { selectTheme } from '../store/slices/settingsSlice';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto';
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const settingsTheme = useAppSelector(selectTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Resolve auto theme based on system preference
  useEffect(() => {
    const resolveTheme = () => {
      if (settingsTheme === 'auto') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(settingsTheme as 'light' | 'dark');
      }
    };

    resolveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => resolveTheme();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settingsTheme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const handleSetTheme = (theme: 'light' | 'dark' | 'auto') => {
    dispatch(setTheme(theme));
  };

  const handleToggleTheme = () => {
    const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(settingsTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    handleSetTheme(nextTheme);
  };

  const value: ThemeContextType = {
    theme: settingsTheme,
    resolvedTheme,
    toggleTheme: handleToggleTheme,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;