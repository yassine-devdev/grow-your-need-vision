/**
 * User API Slice
 * RTK Query API for user operations
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { authService, User } from '../../services/authService';
import { AppError } from '../../services/errorHandler';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  verified: boolean;
  created: string;
  updated: string;
  preferences?: {
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
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  usersByCountry: Record<string, number>;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['User', 'UserProfile', 'UserStats'],
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query<UserProfile, string | undefined>({
      queryFn: async (userId) => {
        try {
          const user = await authService.getProfile(userId);
          return { data: user as UserProfile };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: (result, error, userId) => [{ type: 'UserProfile', id: userId }],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<UserProfile, {
      userId?: string;
      data: {
        name?: string;
        avatar?: File;
        preferences?: Partial<UserProfile['preferences']>;
      };
    }>({
      queryFn: async ({ userId, data }) => {
        try {
          const user = await authService.updateProfile(data);
          return { data: user as UserProfile };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'UserProfile', id: userId },
        'User',
      ],
    }),

    // Upload avatar
    uploadAvatar: builder.mutation<string, File>({
      queryFn: async (file) => {
        try {
          const user = await authService.updateProfile({ avatar: file });
          return { data: user.avatar || '' };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['UserProfile', 'User'],
    }),

    // Change password
    changePassword: builder.mutation<void, {
      currentPassword: string;
      newPassword: string;
      newPasswordConfirm: string;
    }>({
      queryFn: async (data) => {
        try {
          await authService.changePassword(data);
          return { data: undefined };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Delete account
    deleteAccount: builder.mutation<boolean, { password: string }>({
      queryFn: async ({ password }) => {
        try {
          // This would need to be implemented in authService
          // await authService.deleteAccount(password);
          return { data: true };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['User', 'UserProfile'],
    }),

    // Get user preferences
    getUserPreferences: builder.query<UserProfile['preferences'], string | undefined>({
      queryFn: async (userId) => {
        try {
          const user = await authService.getProfile(userId);
          return { data: user.preferences || {} };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['UserProfile'],
    }),

    // Update user preferences
    updateUserPreferences: builder.mutation<UserProfile['preferences'], {
      preferences: Partial<UserProfile['preferences']>;
      userId?: string;
    }>({
      queryFn: async ({ preferences, userId }) => {
        try {
          const user = await authService.updateProfile({ preferences });
          return { data: user.preferences || {} };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['UserProfile'],
    }),

    // Get user activity
    getUserActivity: builder.query<any[], {
      userId?: string;
      limit?: number;
      offset?: number;
    }>({
      queryFn: async ({ userId, limit = 20, offset = 0 }) => {
        try {
          // This would need to be implemented in authService
          // const activity = await authService.getUserActivity(userId, limit, offset);
          // return { data: activity };
          return { data: [] };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Get user stats (admin only)
    getUserStats: builder.query<UserStats, void>({
      queryFn: async () => {
        try {
          // This would need to be implemented in authService
          // const stats = await authService.getUserStats();
          // return { data: stats };
          return { 
            data: {
              totalUsers: 0,
              activeUsers: 0,
              newUsersThisMonth: 0,
              usersByRole: {},
              usersByCountry: {},
            }
          };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['UserStats'],
    }),

    // Search users
    searchUsers: builder.query<User[], {
      query: string;
      limit?: number;
      offset?: number;
    }>({
      queryFn: async ({ query, limit = 20, offset = 0 }) => {
        try {
          // This would need to be implemented in authService
          // const users = await authService.searchUsers(query, limit, offset);
          // return { data: users };
          return { data: [] };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['User'],
    }),

    // Follow user
    followUser: builder.mutation<boolean, string>({
      queryFn: async (userId) => {
        try {
          // This would need to be implemented in authService
          // await authService.followUser(userId);
          return { data: true };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Unfollow user
    unfollowUser: builder.mutation<boolean, string>({
      queryFn: async (userId) => {
        try {
          // This would need to be implemented in authService
          // await authService.unfollowUser(userId);
          return { data: true };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Get following list
    getFollowing: builder.query<User[], {
      userId?: string;
      limit?: number;
      offset?: number;
    }>({
      queryFn: async ({ userId, limit = 20, offset = 0 }) => {
        try {
          // This would need to be implemented in authService
          // const following = await authService.getFollowing(userId, limit, offset);
          // return { data: following };
          return { data: [] };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['User'],
    }),

    // Get followers list
    getFollowers: builder.query<User[], {
      userId?: string;
      limit?: number;
      offset?: number;
    }>({
      queryFn: async ({ userId, limit = 20, offset = 0 }) => {
        try {
          // This would need to be implemented in authService
          // const followers = await authService.getFollowers(userId, limit, offset);
          // return { data: followers };
          return { data: [] };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['User'],
    }),

    // Block user
    blockUser: builder.mutation<boolean, string>({
      queryFn: async (userId) => {
        try {
          // This would need to be implemented in authService
          // await authService.blockUser(userId);
          return { data: true };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Unblock user
    unblockUser: builder.mutation<boolean, string>({
      queryFn: async (userId) => {
        try {
          // This would need to be implemented in authService
          // await authService.unblockUser(userId);
          return { data: true };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Get blocked users
    getBlockedUsers: builder.query<User[], void>({
      queryFn: async () => {
        try {
          // This would need to be implemented in authService
          // const blocked = await authService.getBlockedUsers();
          // return { data: blocked };
          return { data: [] };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['User'],
    }),

    // Report user
    reportUser: builder.mutation<boolean, {
      userId: string;
      reason: string;
      description?: string;
    }>({
      queryFn: async ({ userId, reason, description }) => {
        try {
          // This would need to be implemented in authService
          // await authService.reportUser(userId, reason, description);
          return { data: true };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Verify email
    verifyEmail: builder.mutation<boolean, { token: string }>({
      queryFn: async ({ token }) => {
        try {
          await authService.confirmEmailVerification(token);
          return { data: true };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['UserProfile', 'User'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useGetUserActivityQuery,
  useGetUserStatsQuery,
  useSearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowingQuery,
  useGetFollowersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetBlockedUsersQuery,
  useReportUserMutation,
  useVerifyEmailMutation,
} = userApi;

export default userApi;