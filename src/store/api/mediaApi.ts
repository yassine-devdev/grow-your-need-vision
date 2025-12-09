/**
 * Media API Slice
 * RTK Query API for media operations
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { mediaService, MediaItem, CreateMediaData, UpdateMediaData } from '../../services/mediaService';
import { AppError } from '../../services/errorHandler';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Media', 'MediaItem', 'FeaturedMedia'],
  endpoints: (builder) => ({
    // Get media list
    getMedia: builder.query<MediaItem[], {
      page?: number;
      limit?: number;
      filter?: string;
      sort?: string;
    }>({
      queryFn: async (params) => {
        try {
          const media = await mediaService.getMedia(params);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Media'],
    }),

    // Get media by type
    getMediaByType: builder.query<MediaItem[], {
      type: MediaItem['type'];
      params?: {
        page?: number;
        limit?: number;
        filter?: string;
        sort?: string;
      };
    }>({
      queryFn: async ({ type, params }) => {
        try {
          const media = await mediaService.getMediaByType(type, params);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Media'],
    }),

    // Get media by genre
    getMediaByGenre: builder.query<MediaItem[], {
      genre: string;
      params?: {
        page?: number;
        limit?: number;
        filter?: string;
        sort?: string;
      };
    }>({
      queryFn: async ({ genre, params }) => {
        try {
          const media = await mediaService.getMediaByGenre(genre, params);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Media'],
    }),

    // Get featured media
    getFeaturedMedia: builder.query<MediaItem[], { limit?: number }>({
      queryFn: async ({ limit = 5 }) => {
        try {
          const media = await mediaService.getFeaturedMedia(limit);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['FeaturedMedia'],
    }),

    // Get recommended media
    getRecommendedMedia: builder.query<MediaItem[], {
      userId: string;
      limit?: number;
    }>({
      queryFn: async ({ userId, limit = 10 }) => {
        try {
          const media = await mediaService.getRecommendedMedia(userId, limit);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Media'],
    }),

    // Get trending media
    getTrendingMedia: builder.query<MediaItem[], {
      days?: number;
      limit?: number;
    }>({
      queryFn: async ({ days = 7, limit = 10 }) => {
        try {
          const media = await mediaService.getTrendingMedia(days, limit);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['FeaturedMedia'],
    }),

    // Get related media
    getRelatedMedia: builder.query<MediaItem[], {
      mediaId: string;
      limit?: number;
    }>({
      queryFn: async ({ mediaId, limit = 5 }) => {
        try {
          const media = await mediaService.getRelatedMedia(mediaId, limit);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: (result, error, { mediaId }) => [
        { type: 'MediaItem', id: mediaId },
        'Media',
      ],
    }),

    // Search media
    searchMedia: builder.query<MediaItem[], {
      query: string;
      params?: {
        page?: number;
        limit?: number;
        filter?: string;
        sort?: string;
      };
    }>({
      queryFn: async ({ query, params }) => {
        try {
          const media = await mediaService.searchMedia(query, params);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Media'],
    }),

    // Get single media item
    getMediaItem: builder.query<MediaItem, string>({
      queryFn: async (id) => {
        try {
          const media = await mediaService.getOne(id);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: (result, error, id) => [{ type: 'MediaItem', id }],
    }),

    // Create media item
    createMediaItem: builder.mutation<MediaItem, {
      data: CreateMediaData;
      files?: Record<string, File>;
    }>({
      queryFn: async ({ data, files }) => {
        try {
          const media = await mediaService.createMedia({ data, files });
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['Media'],
    }),

    // Update media item
    updateMediaItem: builder.mutation<MediaItem, {
      id: string;
      data: UpdateMediaData;
      files?: Record<string, File>;
    }>({
      queryFn: async ({ id, data, files }) => {
        try {
          const media = await mediaService.updateMedia({ id, data, files });
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'MediaItem', id },
        'Media',
        'FeaturedMedia',
      ],
    }),

    // Delete media item
    deleteMediaItem: builder.mutation<boolean, string>({
      queryFn: async (id) => {
        try {
          const success = await mediaService.deleteMedia(id);
          return { data: success };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'MediaItem', id },
        'Media',
        'FeaturedMedia',
      ],
    }),

    // Toggle featured status
    toggleFeatured: builder.mutation<MediaItem, string>({
      queryFn: async (id) => {
        try {
          const media = await mediaService.toggleFeatured(id);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'MediaItem', id },
        'FeaturedMedia',
      ],
    }),

    // Update match score
    updateMatchScore: builder.mutation<MediaItem, {
      id: string;
      score: number;
    }>({
      queryFn: async ({ id, score }) => {
        try {
          const media = await mediaService.updateMatchScore(id, score);
          return { data: media };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'MediaItem', id },
        'Media',
      ],
    }),

    // Get media statistics
    getMediaStats: builder.query<{
      total: number;
      byType: Record<string, number>;
      byGenre: Record<string, number>;
      featured: number;
    }, void>({
      queryFn: async () => {
        try {
          const stats = await mediaService.getMediaStats();
          return { data: stats };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Media'],
    }),

    // Subscribe to media updates
    subscribeToMedia: builder.query<void, void>({
      queryFn: async () => {
        try {
          const unsubscribe = mediaService.subscribe((data) => {
            // Handle real-time updates
            console.log('Media update:', data);
          });
          return { data: undefined };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),
  }),
});

export const {
  useGetMediaQuery,
  useGetMediaByTypeQuery,
  useGetMediaByGenreQuery,
  useGetFeaturedMediaQuery,
  useGetRecommendedMediaQuery,
  useGetTrendingMediaQuery,
  useGetRelatedMediaQuery,
  useSearchMediaQuery,
  useGetMediaItemQuery,
  useCreateMediaItemMutation,
  useUpdateMediaItemMutation,
  useDeleteMediaItemMutation,
  useToggleFeaturedMutation,
  useUpdateMatchScoreMutation,
  useGetMediaStatsQuery,
  useSubscribeToMediaQuery,
} = mediaApi;

export default mediaApi;