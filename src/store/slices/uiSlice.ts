/**
 * UI Slice
 * Manages UI state including overlays, modals, loading states, and theme
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoadingState {
  [key: string]: boolean;
}

interface ModalState {
  [key: string]: boolean;
}

interface UIState {
  // Overlay state
  activeOverlay: string | null;
  overlayData: any;
  
  // Modal state
  modals: ModalState;
  
  // Loading states
  loading: LoadingState;
  
  // Theme
  theme: 'light' | 'dark' | 'auto';
  
  // Sidebar
  sidebarOpen: boolean;
  
  // Notifications panel
  notificationsOpen: boolean;
  
  // Search
  searchOpen: boolean;
  searchQuery: string;
  
  // Screen size
  screenSize: 'mobile' | 'tablet' | 'desktop';
  
  // Page title
  pageTitle: string;
  
  // Breadcrumbs
  breadcrumbs: Array<{ label: string; path?: string }>;
  
  // Error handling
  globalError: string | null;
  
  // App preferences
  compactMode: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}

const initialState: UIState = {
  activeOverlay: null,
  overlayData: null,
  modals: {},
  loading: {},
  theme: 'auto',
  sidebarOpen: true,
  notificationsOpen: false,
  searchOpen: false,
  searchQuery: '',
  screenSize: 'desktop',
  pageTitle: 'Grow Your Need Vision',
  breadcrumbs: [],
  globalError: null,
  compactMode: false,
  animationsEnabled: true,
  soundEnabled: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Overlay management
    openOverlay: (state, action: PayloadAction<{ appName: string; data?: any }>) => {
      state.activeOverlay = action.payload.appName;
      state.overlayData = action.payload.data || null;
    },
    
    closeOverlay: (state) => {
      state.activeOverlay = null;
      state.overlayData = null;
    },
    
    updateOverlayData: (state, action: PayloadAction<any>) => {
      state.overlayData = action.payload;
    },
    
    // Modal management
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    
    closeAllModals: (state) => {
      state.modals = {};
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },
    
    clearAllLoading: (state) => {
      state.loading = {};
    },
    
    // Theme management
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      if (state.theme === 'light') {
        state.theme = 'dark';
      } else if (state.theme === 'dark') {
        state.theme = 'auto';
      } else {
        state.theme = 'light';
      }
    },
    
    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Notifications panel
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen;
    },
    
    setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationsOpen = action.payload;
    },
    
    // Search management
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchOpen = false;
    },
    
    // Screen size
    setScreenSize: (state, action: PayloadAction<'mobile' | 'tablet' | 'desktop'>) => {
      state.screenSize = action.payload;
      
      // Auto-close sidebar on mobile
      if (action.payload === 'mobile') {
        state.sidebarOpen = false;
      }
    },
    
    // Page management
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; path?: string }>>) => {
      state.breadcrumbs = action.payload;
    },
    
    addBreadcrumb: (state, action: PayloadAction<{ label: string; path?: string }>) => {
      state.breadcrumbs.push(action.payload);
    },
    
    // Error handling
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.globalError = action.payload;
    },
    
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    // App preferences
    toggleCompactMode: (state) => {
      state.compactMode = !state.compactMode;
    },
    
    setCompactMode: (state, action: PayloadAction<boolean>) => {
      state.compactMode = action.payload;
    },
    
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
    },
    
    setAnimationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.animationsEnabled = action.payload;
    },
    
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
    },
    
    // Reset UI state
    resetUI: (state) => {
      return { ...initialState, theme: state.theme }; // Keep theme preference
    },
  },
});

export const {
  openOverlay,
  closeOverlay,
  updateOverlayData,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  clearLoading,
  clearAllLoading,
  setTheme,
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleNotifications,
  setNotificationsOpen,
  toggleSearch,
  setSearchOpen,
  setSearchQuery,
  clearSearch,
  setScreenSize,
  setPageTitle,
  setBreadcrumbs,
  addBreadcrumb,
  setGlobalError,
  clearGlobalError,
  toggleCompactMode,
  setCompactMode,
  toggleAnimations,
  setAnimationsEnabled,
  toggleSound,
  setSoundEnabled,
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectActiveOverlay = (state: { ui: UIState }) => state.ui.activeOverlay;
export const selectOverlayData = (state: { ui: UIState }) => state.ui.overlayData;
export const selectModal = (key: string) => (state: { ui: UIState }) => state.ui.modals[key];
export const selectLoading = (key: string) => (state: { ui: UIState }) => state.ui.loading[key];
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectNotificationsOpen = (state: { ui: UIState }) => state.ui.notificationsOpen;
export const selectSearchOpen = (state: { ui: UIState }) => state.ui.searchOpen;
export const selectSearchQuery = (state: { ui: UIState }) => state.ui.searchQuery;
export const selectScreenSize = (state: { ui: UIState }) => state.ui.screenSize;
export const selectPageTitle = (state: { ui: UIState }) => state.ui.pageTitle;
export const selectBreadcrumbs = (state: { ui: UIState }) => state.ui.breadcrumbs;
export const selectGlobalError = (state: { ui: UIState }) => state.ui.globalError;
export const selectCompactMode = (state: { ui: UIState }) => state.ui.compactMode;
export const selectAnimationsEnabled = (state: { ui: UIState }) => state.ui.animationsEnabled;
export const selectSoundEnabled = (state: { ui: UIState }) => state.ui.soundEnabled;

// Memoized selectors for derived state
export const selectIsMobile = (state: { ui: UIState }) => state.ui.screenSize === 'mobile';
export const selectIsTablet = (state: { ui: UIState }) => state.ui.screenSize === 'tablet';
export const selectIsDesktop = (state: { ui: UIState }) => state.ui.screenSize === 'desktop';
export const selectAnyModalOpen = (state: { ui: UIState }) => Object.values(state.ui.modals).some(Boolean);
export const selectAnyLoading = (state: { ui: UIState }) => Object.values(state.ui.loading).some(Boolean);

export default uiSlice.reducer;