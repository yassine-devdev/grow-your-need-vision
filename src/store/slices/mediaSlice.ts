/**
 * Media Slice
 * Manages media state including items, filters, and playback
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MediaItem } from '../../services/mediaService';

interface MediaState {
  // Media items
  items: MediaItem[];
  featuredItems: MediaItem[];
  currentItem: MediaItem | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  
  // Filters and search
  activeType: MediaItem['type'] | 'all';
  activeGenre: string;
  searchQuery: string;
  sortBy: 'created' | 'title' | 'rating' | 'matchScore' | 'releaseYear';
  sortOrder: 'asc' | 'desc';
  
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  quality: string;
  isFullscreen: boolean;
  
  // Watchlist and favorites
  watchlist: string[];
  favorites: string[];
  viewedItems: string[];
  
  // UI state
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list' | 'carousel';
  
  // Stats
  playCount: Record<string, number>;
  watchTime: Record<string, number>;
}

const initialState: MediaState = {
  items: [],
  featuredItems: [],
  currentItem: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasMore: false,
  activeType: 'all',
  activeGenre: '',
  searchQuery: '',
  sortBy: 'created',
  sortOrder: 'desc',
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  quality: 'auto',
  isFullscreen: false,
  watchlist: [],
  favorites: [],
  viewedItems: [],
  loading: false,
  error: null,
  viewMode: 'grid',
  playCount: {},
  watchTime: {},
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    // Media items management
    setMediaItems: (state, action: PayloadAction<MediaItem[]>) => {
      state.items = action.payload;
    },
    
    appendMediaItems: (state, action: PayloadAction<MediaItem[]>) => {
      state.items.push(...action.payload);
    },
    
    setFeaturedItems: (state, action: PayloadAction<MediaItem[]>) => {
      state.featuredItems = action.payload;
    },
    
    setCurrentItem: (state, action: PayloadAction<MediaItem | null>) => {
      state.currentItem = action.payload;
    },
    
    // Pagination
    setPagination: (state, action: PayloadAction<{
      page: number;
      totalPages: number;
      totalItems: number;
      hasMore: boolean;
    }>) => {
      state.currentPage = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.totalItems = action.payload.totalItems;
      state.hasMore = action.payload.hasMore;
    },
    
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Filters and search
    setActiveType: (state, action: PayloadAction<MediaItem['type'] | 'all'>) => {
      state.activeType = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    setActiveGenre: (state, action: PayloadAction<string>) => {
      state.activeGenre = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    setSortBy: (state, action: PayloadAction<MediaState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    
    clearFilters: (state) => {
      state.activeType = 'all';
      state.activeGenre = '';
      state.searchQuery = '';
      state.currentPage = 1;
    },
    
    // Playback control
    playMedia: (state) => {
      state.isPlaying = true;
    },
    
    pauseMedia: (state) => {
      state.isPlaying = false;
    },
    
    stopMedia: (state) => {
      state.isPlaying = false;
      state.currentTime = 0;
    },
    
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },
    
    setQuality: (state, action: PayloadAction<string>) => {
      state.quality = action.payload;
    },
    
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    
    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
    
    // Watchlist and favorites
    toggleWatchlist: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const index = state.watchlist.indexOf(itemId);
      if (index > -1) {
        state.watchlist.splice(index, 1);
      } else {
        state.watchlist.push(itemId);
      }
    },
    
    addToWatchlist: (state, action: PayloadAction<string>) => {
      if (!state.watchlist.includes(action.payload)) {
        state.watchlist.push(action.payload);
      }
    },
    
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter(id => id !== action.payload);
    },
    
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const index = state.favorites.indexOf(itemId);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(itemId);
      }
    },
    
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    
    markAsViewed: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      if (!state.viewedItems.includes(itemId)) {
        state.viewedItems.push(itemId);
      }
    },
    
    // UI state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setViewMode: (state, action: PayloadAction<'grid' | 'list' | 'carousel'>) => {
      state.viewMode = action.payload;
    },
    
    // Stats tracking
    incrementPlayCount: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.playCount[itemId] = (state.playCount[itemId] || 0) + 1;
    },
    
    updateWatchTime: (state, action: PayloadAction<{ itemId: string; seconds: number }>) => {
      const { itemId, seconds } = action.payload;
      state.watchTime[itemId] = (state.watchTime[itemId] || 0) + seconds;
    },
    
    // Reset state
    resetMediaState: (state) => {
      state.currentItem = null;
      state.isPlaying = false;
      state.currentTime = 0;
      state.duration = 0;
      state.isFullscreen = false;
    },
    
    // Clear all data
    clearMediaData: () => initialState,
  },
});

export const {
  setMediaItems,
  appendMediaItems,
  setFeaturedItems,
  setCurrentItem,
  setPagination,
  setCurrentPage,
  setActiveType,
  setActiveGenre,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  clearFilters,
  playMedia,
  pauseMedia,
  stopMedia,
  setCurrentTime,
  setDuration,
  setVolume,
  setPlaybackRate,
  setQuality,
  toggleFullscreen,
  setFullscreen,
  toggleWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  toggleFavorite,
  addToFavorites,
  removeFromFavorites,
  markAsViewed,
  setLoading,
  setError,
  setViewMode,
  incrementPlayCount,
  updateWatchTime,
  resetMediaState,
  clearMediaData,
} = mediaSlice.actions;

// Selectors
export const selectMedia = (state: { media: MediaState }) => state.media;
export const selectMediaItems = (state: { media: MediaState }) => state.media.items;
export const selectFeaturedItems = (state: { media: MediaState }) => state.media.featuredItems;
export const selectCurrentItem = (state: { media: MediaState }) => state.media.currentItem;
export const selectMediaPagination = (state: { media: MediaState }) => ({
  page: state.media.currentPage,
  totalPages: state.media.totalPages,
  totalItems: state.media.totalItems,
  hasMore: state.media.hasMore,
});
export const selectMediaFilters = (state: { media: MediaState }) => ({
  type: state.media.activeType,
  genre: state.media.activeGenre,
  search: state.media.searchQuery,
  sortBy: state.media.sortBy,
  sortOrder: state.media.sortOrder,
});
export const selectPlaybackState = (state: { media: MediaState }) => ({
  isPlaying: state.media.isPlaying,
  currentTime: state.media.currentTime,
  duration: state.media.duration,
  volume: state.media.volume,
  playbackRate: state.media.playbackRate,
  quality: state.media.quality,
  isFullscreen: state.media.isFullscreen,
});
export const selectWatchlist = (state: { media: MediaState }) => state.media.watchlist;
export const selectFavorites = (state: { media: MediaState }) => state.media.favorites;
export const selectViewedItems = (state: { media: MediaState }) => state.media.viewedItems;
export const selectMediaLoading = (state: { media: MediaState }) => state.media.loading;
export const selectMediaError = (state: { media: MediaState }) => state.media.error;
export const selectViewMode = (state: { media: MediaState }) => state.media.viewMode;
export const selectMediaStats = (state: { media: MediaState }) => ({
  playCount: state.media.playCount,
  watchTime: state.media.watchTime,
});

// Memoized selectors
export const selectFilteredItems = (state: { media: MediaState }) => {
  const { items, activeType, activeGenre, searchQuery } = state.media;
  
  return items.filter(item => {
    const matchesType = activeType === 'all' || item.type === activeType;
    const matchesGenre = !activeGenre || item.genre === activeGenre;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesGenre && matchesSearch;
  });
};

export const selectIsInWatchlist = (itemId: string) => (state: { media: MediaState }) => 
  state.media.watchlist.includes(itemId);

export const selectIsFavorite = (itemId: string) => (state: { media: MediaState }) => 
  state.media.favorites.includes(itemId);

export const selectIsViewed = (itemId: string) => (state: { media: MediaState }) => 
  state.media.viewedItems.includes(itemId);

export default mediaSlice.reducer;