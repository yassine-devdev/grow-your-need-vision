/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */

import { BaseService } from './BaseService';
import { pb } from '../lib/pocketbase';
import { errorHandler, AuthenticationError, ValidationError } from './errorHandler';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  verified: boolean;
  created: string;
  updated: string;
  lastLogin?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showActivity: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirm: string;
  username: string;
  name: string;
}

export interface ProfileUpdateData {
  name?: string;
  avatar?: File;
  preferences?: Partial<UserPreferences>;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  password: string;
  passwordConfirm: string;
}

class AuthService extends BaseService<User> {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  constructor() {
    super('users');
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize authentication state
   */
  private initializeAuth(): void {
    if (this.pb.authStore.isValid) {
      this.currentUser = this.pb.authStore.model as User;
    }

    // Listen to auth state changes
    this.pb.authStore.onChange(() => {
      this.currentUser = this.pb.authStore.model as User;
      this.notifyAuthListeners();
    });
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      this.validateLoginData(credentials);

      const authData = await this.pb.collection('users').authWithPassword(
        credentials.email,
        credentials.password
      );

      // Update last login
      await this.update(authData.record.id, {
        lastLogin: new Date().toISOString()
      });

      this.currentUser = authData.record as User;
      this.notifyAuthListeners();

      return this.currentUser;
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<User> {
    try {
      this.validateRegisterData(data);

      const userData = {
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        username: data.username,
        name: data.name,
        role: 'user',
        verified: false,
        preferences: {
          theme: 'auto',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showActivity: true
          }
        }
      };

      const record = await this.pb.collection('users').create(userData);
      
      // Auto-verify for development, send email for production
      if (process.env.NODE_ENV === 'development') {
        await this.pb.collection('users').requestVerification(data.email);
      }

      return record as User;
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      this.pb.authStore.clear();
      this.currentUser = null;
      this.notifyAuthListeners();
      this.clearCache();
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.pb.authStore.isValid && this.currentUser !== null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Get user profile
   */
  async getProfile(userId?: string): Promise<User> {
    try {
      const id = userId || this.currentUser?.id;
      if (!id) {
        throw new AuthenticationError('User not authenticated');
      }

      return await this.getOne(id, { expand: 'preferences' });
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    try {
      if (!this.currentUser) {
        throw new AuthenticationError('User not authenticated');
      }

      const updateData: any = {};
      
      if (data.name) updateData.name = data.name;
      if (data.preferences) {
        updateData.preferences = {
          ...this.currentUser.preferences,
          ...data.preferences
        };
      }

      const result = await this.update({
        id: this.currentUser.id,
        data: updateData,
        files: data.avatar ? { avatar: data.avatar } : undefined
      });

      this.currentUser = result;
      this.notifyAuthListeners();

      return result;
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(data: PasswordChangeData): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new AuthenticationError('User not authenticated');
      }

      this.validatePasswordChangeData(data);

      await this.pb.collection('users').update(this.currentUser.id, {
        oldPassword: data.currentPassword,
        password: data.newPassword,
        passwordConfirm: data.newPasswordConfirm
      });
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetData): Promise<void> {
    try {
      if (!data.email?.trim()) {
        throw new ValidationError('Email is required');
      }

      await this.pb.collection('users').requestPasswordReset(data.email);
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<void> {
    try {
      this.validatePasswordResetData(data);

      await this.pb.collection('users').confirmPasswordReset(
        data.token,
        data.password,
        data.passwordConfirm
      );
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(email?: string): Promise<void> {
    try {
      const userEmail = email || this.currentUser?.email;
      if (!userEmail) {
        throw new ValidationError('Email is required');
      }

      await this.pb.collection('users').requestVerification(userEmail);
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Confirm email verification
   */
  async confirmEmailVerification(token: string): Promise<void> {
    try {
      await this.pb.collection('users').confirmVerification(token);
      
      if (this.currentUser) {
        const updatedUser = await this.getOne(this.currentUser.id);
        this.currentUser = updatedUser;
        this.notifyAuthListeners();
      }
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Refresh auth token
   */
  async refreshToken(): Promise<void> {
    try {
      if (!this.pb.authStore.isValid) {
        throw new AuthenticationError('No valid authentication token');
      }

      await this.pb.collection('users').authRefresh();
    } catch (error) {
      throw errorHandler.handle(error);
    }
  }

  /**
   * Add auth state listener
   */
  onAuthChange(listener: (user: User | null) => void): () => void {
    this.authListeners.push(listener);
    return () => {
      const index = this.authListeners.indexOf(listener);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all auth listeners
   */
  private notifyAuthListeners(): void {
    this.authListeners.forEach(listener => listener(this.currentUser));
  }

  /**
   * Validate login data
   */
  private validateLoginData(data: LoginCredentials): void {
    if (!data.email?.trim()) {
      throw new ValidationError('Email is required');
    }
    if (!data.password?.trim()) {
      throw new ValidationError('Password is required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  /**
   * Validate register data
   */
  private validateRegisterData(data: RegisterData): void {
    if (!data.email?.trim()) {
      throw new ValidationError('Email is required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }
    if (!data.password?.trim()) {
      throw new ValidationError('Password is required');
    }
    if (data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    if (data.password !== data.passwordConfirm) {
      throw new ValidationError('Passwords do not match');
    }
    if (!data.username?.trim()) {
      throw new ValidationError('Username is required');
    }
    if (data.username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      throw new ValidationError('Username can only contain letters, numbers, and underscores');
    }
    if (!data.name?.trim()) {
      throw new ValidationError('Name is required');
    }
  }

  /**
   * Validate password change data
   */
  private validatePasswordChangeData(data: PasswordChangeData): void {
    if (!data.currentPassword?.trim()) {
      throw new ValidationError('Current password is required');
    }
    if (!data.newPassword?.trim()) {
      throw new ValidationError('New password is required');
    }
    if (data.newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters');
    }
    if (data.newPassword !== data.newPasswordConfirm) {
      throw new ValidationError('New passwords do not match');
    }
  }

  /**
   * Validate password reset data
   */
  private validatePasswordResetData(data: PasswordResetConfirmData): void {
    if (!data.token?.trim()) {
      throw new ValidationError('Reset token is required');
    }
    if (!data.password?.trim()) {
      throw new ValidationError('Password is required');
    }
    if (data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    if (data.password !== data.passwordConfirm) {
      throw new ValidationError('Passwords do not match');
    }
  }
}

export const authService = AuthService.getInstance();
export type { User, UserPreferences, LoginCredentials, RegisterData, ProfileUpdateData, PasswordChangeData };