/**
 * Settings Slice
 * Manages application settings and user preferences
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppSettings {
  // Theme
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  
  // Language
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  
  // Notifications
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    marketing: boolean;
    updates: boolean;
  };
  
  // Privacy
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showActivity: boolean;
    dataCollection: boolean;
    analytics: boolean;
  };
  
  // Accessibility
  accessibility: {
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  
  // Performance
  performance: {
    animations: boolean;
    transitions: boolean;
    effects: boolean;
    hardwareAcceleration: boolean;
  };
  
  // Features
  features: {
    betaFeatures: boolean;
    experimentalFeatures: boolean;
    developerMode: boolean;
    debugMode: boolean;
  };
  
  // Data & Storage
  storage: {
    autoSave: boolean;
    localCache: boolean;
    cacheSize: number;
    dataRetention: number; // in days
  };
  
  // Security
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number; // in minutes
    autoLock: boolean;
    loginNotifications: boolean;
  };
  
  // API & Integrations
  integrations: {
    apiKeys: Record<string, string>;
    webhooks: WebhookConfig[];
    connectedServices: ConnectedService[];
  };
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
}

export interface ConnectedService {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  data: Record<string, any>;
  lastSync?: string;
}

const defaultSettings: AppSettings = {
  theme: 'auto',
  accentColor: '#3b82f6',
  language: 'en',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  timezone: 'America/New_York',
  notifications: {
    email: true,
    push: true,
    desktop: true,
    marketing: false,
    updates: true,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showActivity: true,
    dataCollection: true,
    analytics: true,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: true,
  },
  performance: {
    animations: true,
    transitions: true,
    effects: true,
    hardwareAcceleration: true,
  },
  features: {
    betaFeatures: false,
    experimentalFeatures: false,
    developerMode: false,
    debugMode: false,
  },
  storage: {
    autoSave: true,
    localCache: true,
    cacheSize: 100, // MB
    dataRetention: 30, // days
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 24 * 60, // 24 hours
    autoLock: false,
    loginNotifications: true,
  },
  integrations: {
    apiKeys: {},
    webhooks: [],
    connectedServices: [],
  },
};

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  saving: boolean;
  lastSaved: string | null;
  hasUnsavedChanges: boolean;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
}

const initialState: SettingsState = {
  settings: defaultSettings,
  loading: false,
  saving: false,
  lastSaved: null,
  hasUnsavedChanges: false,
  syncStatus: 'synced',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload;
    },
    
    // Settings management
    setSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    resetSettings: (state) => {
      state.settings = defaultSettings;
      state.hasUnsavedChanges = true;
    },
    
    // Theme settings
    setTheme: (state, action: PayloadAction<AppSettings['theme']>) => {
      state.settings.theme = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.settings.accentColor = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    // Language settings
    setLanguage: (state, action: PayloadAction<string>) => {
      state.settings.language = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    setDateFormat: (state, action: PayloadAction<string>) => {
      state.settings.dateFormat = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    setTimeFormat: (state, action: PayloadAction<'12h' | '24h'>) => {
      state.settings.timeFormat = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    setTimezone: (state, action: PayloadAction<string>) => {
      state.settings.timezone = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    // Notification settings
    updateNotificationSettings: (state, action: PayloadAction<Partial<AppSettings['notifications']>>) => {
      state.settings.notifications = { ...state.settings.notifications, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    // Privacy settings
    updatePrivacySettings: (state, action: PayloadAction<Partial<AppSettings['privacy']>>) => {
      state.settings.privacy = { ...state.settings.privacy, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    // Accessibility settings
    updateAccessibilitySettings: (state, action: PayloadAction<Partial<AppSettings['accessibility']>>) => {
      state.settings.accessibility = { ...state.settings.accessibility, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    // Performance settings
    updatePerformanceSettings: (state, action: PayloadAction<Partial<AppSettings['performance']>>) => {
      state.settings.performance = { ...state.settings.performance, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    // Feature settings
    updateFeatureSettings: (state, action: PayloadAction<Partial<AppSettings['features']>>) => {
      state.settings.features = { ...state.settings.features, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    // Storage settings
    updateStorageSettings: (state, action: PayloadAction<Partial<AppSettings['storage']>>) => {
      state.settings.storage = { ...state.settings.storage, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    // Security settings
    updateSecuritySettings: (state, action: PayloadAction<Partial<AppSettings['security']>>) => {
      state.settings.security = { ...state.settings.security, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    // Integration settings
    addApiKey: (state, action: PayloadAction<{ service: string; key: string }>) => {
      state.settings.integrations.apiKeys[action.payload.service] = action.payload.key;
      state.hasUnsavedChanges = true;
    },
    
    removeApiKey: (state, action: PayloadAction<string>) => {
      delete state.settings.integrations.apiKeys[action.payload];
      state.hasUnsavedChanges = true;
    },
    
    addWebhook: (state, action: PayloadAction<WebhookConfig>) => {
      state.settings.integrations.webhooks.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    
    updateWebhook: (state, action: PayloadAction<{ id: string; updates: Partial<WebhookConfig> }>) => {
      const { id, updates } = action.payload;
      const index = state.settings.integrations.webhooks.findIndex(w => w.id === id);
      if (index > -1) {
        state.settings.integrations.webhooks[index] = { 
          ...state.settings.integrations.webhooks[index], 
          ...updates 
        };
        state.hasUnsavedChanges = true;
      }
    },
    
    removeWebhook: (state, action: PayloadAction<string>) => {
      state.settings.integrations.webhooks = state.settings.integrations.webhooks.filter(
        w => w.id !== action.payload
      );
      state.hasUnsavedChanges = true;
    },
    
    addConnectedService: (state, action: PayloadAction<ConnectedService>) => {
      state.settings.integrations.connectedServices.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    
    updateConnectedService: (state, action: PayloadAction<{ id: string; updates: Partial<ConnectedService> }>) => {
      const { id, updates } = action.payload;
      const index = state.settings.integrations.connectedServices.findIndex(s => s.id === id);
      if (index > -1) {
        state.settings.integrations.connectedServices[index] = { 
          ...state.settings.integrations.connectedServices[index], 
          ...updates 
        };
        state.hasUnsavedChanges = true;
      }
    },
    
    removeConnectedService: (state, action: PayloadAction<string>) => {
      state.settings.integrations.connectedServices = state.settings.integrations.connectedServices.filter(
        s => s.id !== action.payload
      );
      state.hasUnsavedChanges = true;
    },
    
    // Sync status
    setSyncStatus: (state, action: PayloadAction<SettingsState['syncStatus']>) => {
      state.syncStatus = action.payload;
    },
    
    // Save management
    markAsSaved: (state) => {
      state.lastSaved = new Date().toISOString();
      state.hasUnsavedChanges = false;
      state.syncStatus = 'synced';
    },
    
    // Load settings from storage
    loadSettings: (state, action: PayloadAction<AppSettings>) => {
      state.settings = { ...defaultSettings, ...action.payload };
      state.loading = false;
      state.hasUnsavedChanges = false;
    },
    
    // Export/Import
    exportSettings: (state) => {
      // This would be handled by an async thunk
      return state;
    },
    
    importSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...defaultSettings, ...action.payload };
      state.hasUnsavedChanges = true;
    },
  },
});

export const {
  setLoading,
  setSaving,
  setSettings,
  resetSettings,
  setTheme,
  setAccentColor,
  setLanguage,
  setDateFormat,
  setTimeFormat,
  setTimezone,
  updateNotificationSettings,
  updatePrivacySettings,
  updateAccessibilitySettings,
  updatePerformanceSettings,
  updateFeatureSettings,
  updateStorageSettings,
  updateSecuritySettings,
  addApiKey,
  removeApiKey,
  addWebhook,
  updateWebhook,
  removeWebhook,
  addConnectedService,
  updateConnectedService,
  removeConnectedService,
  setSyncStatus,
  markAsSaved,
  loadSettings,
  exportSettings,
  importSettings,
} = settingsSlice.actions;

// Selectors
export const selectSettings = (state: { settings: SettingsState }) => state.settings.settings;
export const selectSettingsLoading = (state: { settings: SettingsState }) => state.settings.loading;
export const selectSettingsSaving = (state: { settings: SettingsState }) => state.settings.saving;
export const selectLastSaved = (state: { settings: SettingsState }) => state.settings.lastSaved;
export const selectHasUnsavedChanges = (state: { settings: SettingsState }) => state.settings.hasUnsavedChanges;
export const selectSyncStatus = (state: { settings: SettingsState }) => state.settings.syncStatus;

// Specific settings selectors
export const selectThemeSettings = (state: { settings: SettingsState }) => ({
  theme: state.settings.settings.theme,
  accentColor: state.settings.settings.accentColor,
});

export const selectLanguageSettings = (state: { settings: SettingsState }) => ({
  language: state.settings.settings.language,
  dateFormat: state.settings.settings.dateFormat,
  timeFormat: state.settings.settings.timeFormat,
  timezone: state.settings.settings.timezone,
});

export const selectNotificationSettings = (state: { settings: SettingsState }) => state.settings.settings.notifications;
export const selectPrivacySettings = (state: { settings: SettingsState }) => state.settings.settings.privacy;
export const selectAccessibilitySettings = (state: { settings: SettingsState }) => state.settings.settings.accessibility;
export const selectPerformanceSettings = (state: { settings: SettingsState }) => state.settings.settings.performance;
export const selectFeatureSettings = (state: { settings: SettingsState }) => state.settings.settings.features;
export const selectStorageSettings = (state: { settings: SettingsState }) => state.settings.settings.storage;
export const selectSecuritySettings = (state: { settings: SettingsState }) => state.settings.settings.security;
export const selectIntegrationSettings = (state: { settings: SettingsState }) => state.settings.settings.integrations;

export default settingsSlice.reducer;