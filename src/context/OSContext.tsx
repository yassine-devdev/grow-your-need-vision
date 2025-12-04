import React, { createContext, useContext, useState, useCallback } from 'react';

// Types for OS Windows and Processes
export interface WindowProcess {
  id: string;
  appName: string;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  // Optional state for window content (like current tab)
  state?: Record<string, unknown>;
}

interface OSContextType {
  activeOverlayApp: string | null; // Legacy support for single overlay
  windows: WindowProcess[];
  launchApp: (appName: string) => void;
  closeApp: (processId: string) => void;
  minimizeApp: (processId: string) => void;
  focusApp: (processId: string) => void;

  // Global System Actions
  toggleSidebar: () => void;
  sidebarExpanded: boolean;

  // Legacy Overlay Control (to be deprecated eventually but kept for compatibility)
  openOverlay: (appName: string) => void;
  closeOverlay: () => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for Multi-Window System (Future-Proofing)
  const [windows, setWindows] = useState<WindowProcess[]>([]);
  const [windowStack, setWindowStack] = useState<string[]>([]); // Order of Z-Index

  // Legacy State for Single Overlay (Current Implementation)
  const [activeOverlayApp, setActiveOverlayApp] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const openOverlay = useCallback((appName: string) => {
    setActiveOverlayApp(appName);
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlayApp(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded(prev => !prev);
  }, []);

  // -- Window Manager Logic (Hybrid Support) --

  const launchApp = useCallback((appName: string) => {
    // For now, we default to the single overlay mode to match existing architecture
    // In a future update, this could spawn a window in `windows` array
    setActiveOverlayApp(appName);

    // Placeholder logic for multi-window system
    const pid = `${appName}-${Date.now()}`;
    const newWindow: WindowProcess = {
      id: pid,
      appName,
      title: appName,
      isMinimized: false,
      isMaximized: true,
      zIndex: 10 + windows.length
    };
    setWindows(prev => [...prev, newWindow]);
    setWindowStack(prev => [...prev, pid]);
  }, [windows]);

  const closeApp = useCallback((processId: string) => {
    // Logic for window management
    setWindows(prev => prev.filter(w => w.id !== processId));

    // Sync with legacy overlay
    const closingWindow = windows.find(w => w.id === processId);
    if (closingWindow && closingWindow.appName === activeOverlayApp) {
      setActiveOverlayApp(null);
    }
  }, [windows, activeOverlayApp]);

  const minimizeApp = useCallback((processId: string) => {
    setWindows(prev => prev.map(w => w.id === processId ? { ...w, isMinimized: true } : w));
    if (activeOverlayApp) setActiveOverlayApp(null); // Hide overlay visually
  }, [activeOverlayApp]);

  const focusApp = useCallback((processId: string) => {
    // Bring to front logic would go here
    const win = windows.find(w => w.id === processId);
    if (win) {
      setActiveOverlayApp(win.appName);
      setWindows(prev => prev.map(w => w.id === processId ? { ...w, isMinimized: false } : w));
    }
  }, [windows]);

  return (
    <OSContext.Provider value={{
      activeOverlayApp,
      windows,
      launchApp,
      closeApp,
      minimizeApp,
      focusApp,
      toggleSidebar,
      sidebarExpanded,
      openOverlay,
      closeOverlay
    }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (context === undefined) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};