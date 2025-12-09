/**
 * Authentication API Slice
 * RTK Query API for authentication operations
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { authService, User, LoginCredentials, RegisterData, ProfileUpdateData, PasswordChangeData } from '../../services/authService';
import { AppError } from '../../services/errorHandler';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['User', 'Profile'],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<User, LoginCredentials>({
      queryFn: async (credentials) => {
        try {
          const user = await authService.login(credentials);
          return { data: user };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Register
    register: builder.mutation<User, RegisterData>({
      queryFn: async (data) => {
        try {
          const user = await authService.register(data);
          return { data: user };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Logout
    logout: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          await authService.logout();
          return { data: undefined };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['User', 'Profile'],
    }),

    // Get current user
    getCurrentUser: builder.query<User | null, void>({
      queryFn: async () => {
        try {
          const user = authService.getCurrentUser();
          return { data: user };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['User'],
    }),

    // Get user profile
    getProfile: builder.query<User, string | undefined>({
      queryFn: async (userId) => {
        try {
          const user = await authService.getProfile(userId);
          return { data: user };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Profile'],
    }),

    // Update profile
    updateProfile: builder.mutation<User, ProfileUpdateData>({
      queryFn: async (data) => {
        try {
          const user = await authService.updateProfile(data);
          return { data: user };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['User', 'Profile'],
    }),

    // Change password
    changePassword: builder.mutation<void, PasswordChangeData>({
      queryFn: async (data) => {
        try {
          await authService.changePassword(data);
          return { data: undefined };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Request password reset
    requestPasswordReset: builder.mutation<void, { email: string }>({
      queryFn: async ({ email }) => {
        try {
          await authService.requestPasswordReset({ email });
          return { data: undefined };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Confirm password reset
    confirmPasswordReset: builder.mutation<void, {
      token: string;
      password: string;
      passwordConfirm: string;
    }>({
      queryFn: async (data) => {
        try {
          await authService.confirmPasswordReset(data);
          return { data: undefined };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Request email verification
    requestEmailVerification: builder.mutation<void, { email?: string }>({
      queryFn: async ({ email }) => {
        try {
          await authService.requestEmailVerification(email);
          return { data: undefined };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Confirm email verification
    confirmEmailVerification: builder.mutation<void, { token: string }>({
      queryFn: async ({ token }) => {
        try {
          await authService.confirmEmailVerification(token);
          return { data: undefined };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Refresh token
    refreshToken: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          await authService.refreshToken();
          return { data: undefined };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Check session
    checkSession: builder.query<boolean, void>({
      queryFn: async () => {
        try {
          const isValid = authService.isAuthenticated();
          return { data: isValid };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useRequestEmailVerificationMutation,
  useConfirmEmailVerificationMutation,
  useRefreshTokenMutation,
  useCheckSessionQuery,
} = authApi;

export default authApi;