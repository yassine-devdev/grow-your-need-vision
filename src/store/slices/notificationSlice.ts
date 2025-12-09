/**
 * Notification Slice
 * Manages notifications, alerts, and system messages
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'loading';

export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 = persistent
  position?: NotificationPosition;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp: number;
  read: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationSettings {
  enabled: boolean;
  position: NotificationPosition;
  duration: number;
  sound: boolean;
  desktop: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  history: Notification[];
  maxHistory: number;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  position: 'top-right',
  duration: 5000,
  sound: true,
  desktop: true,
  types: {
    info: true,
    success: true,
    warning: true,
    error: true,
    loading: false,
  },
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: defaultSettings,
  history: [],
  maxHistory: 100,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add notification
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        read: false,
      };

      // Check if this notification type is enabled
      if (!state.settings.types[notification.type]) {
        return;
      }

      state.notifications.push(notification);
      state.unreadCount++;

      // Add to history
      state.history.unshift(notification);
      if (state.history.length > state.maxHistory) {
        state.history = state.history.slice(0, state.maxHistory);
      }
    },

    // Remove notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index > -1) {
        const notification = state.notifications[index];
        state.notifications.splice(index, 1);
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Mark notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },

    // Update settings
    updateSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Set notification position
    setPosition: (state, action: PayloadAction<NotificationPosition>) => {
      state.settings.position = action.payload;
    },

    // Set notification duration
    setDuration: (state, action: PayloadAction<number>) => {
      state.settings.duration = action.payload;
    },

    // Toggle sound
    toggleSound: (state) => {
      state.settings.sound = !state.settings.sound;
    },

    // Toggle desktop notifications
    toggleDesktop: (state) => {
      state.settings.desktop = !state.settings.desktop;
    },

    // Toggle notification type
    toggleNotificationType: (state, action: PayloadAction<NotificationType>) => {
      state.settings.types[action.payload] = !state.settings.types[action.payload];
    },

    // Clear history
    clearHistory: (state) => {
      state.history = [];
    },

    // Set max history
    setMaxHistory: (state, action: PayloadAction<number>) => {
      state.maxHistory = action.payload;
      if (state.history.length > action.payload) {
        state.history = state.history.slice(0, action.payload);
      }
    },

    // Remove from history
    removeFromHistory: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(n => n.id !== action.payload);
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  markAsRead,
  markAllAsRead,
  updateSettings,
  setPosition,
  setDuration,
  toggleSound,
  toggleDesktop,
  toggleNotificationType,
  clearHistory,
  setMaxHistory,
  removeFromHistory,
} = notificationSlice.actions;

// Convenience action creators
export const showInfo = (title: string, message: string, options?: Partial<Notification>) => 
  addNotification({ type: 'info', title, message, ...options });

export const showSuccess = (title: string, message: string, options?: Partial<Notification>) => 
  addNotification({ type: 'success', title, message, ...options });

export const showWarning = (title: string, message: string, options?: Partial<Notification>) => 
  addNotification({ type: 'warning', title, message, ...options });

export const showError = (title: string, message: string, options?: Partial<Notification>) => 
  addNotification({ type: 'error', title, message, ...options });

export const showLoading = (title: string, message: string, options?: Partial<Notification>) => 
  addNotification({ type: 'loading', title, message, duration: 0, ...options });

// Selectors
export const selectNotifications = (state: { notifications: NotificationState }) => state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationState }) => state.notifications.unreadCount;
export const selectSettings = (state: { notifications: NotificationState }) => state.notifications.settings;
export const selectHistory = (state: { notifications: NotificationState }) => state.notifications.history;
export const selectActiveNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications.filter(n => !n.read);
export const selectNotificationById = (id: string) => (state: { notifications: NotificationState }) => 
  state.notifications.notifications.find(n => n.id === id);

export default notificationSlice.reducer;