import pb from '../lib/pocketbase';

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'Movie' | 'Series' | 'Documentary' | 'Live TV';
  genre: string[];
  matchScore: number;
  rating: string;
  duration: string;
  year?: number;
  thumbnail?: string;
  video_url?: string;
  embed_url?: string;
  cast?: string[];
  director?: string;
  created: string;
}

export interface TVChannel {
  id: string;
  name: string;
  logo?: string;
  stream_url: string; // M3U8 URL
  category: string;
  country: string;
  language: string;
  is_active: boolean;
}

export interface M3UPlaylist {
  id: string;
  name: string;
  url: string; // M3U8 playlist URL
  added_by: string;
  is_active: boolean;
  last_synced?: string;
  channel_count?: number;
}

export const mediaService = {
  // Media Items
  getMedia: async (filter: string = '') => {
    try {
      const result = await pb.collection('media_items').getList<MediaItem>(1, 50, {
        filter,
        sort: '-created'
      });
      return result;
    } catch (error) {
      console.error('Failed to fetch media:', error);
      // Return empty result instead of mock data for production
      return {
        page: 1,
        perPage: 50,
        totalItems: 0,
        totalPages: 0,
        items: []
      };
    }
  },

  getMediaById: async (id: string) => {
    return await pb.collection('media_items').getOne<MediaItem>(id);
  },

  // Live TV Channels
  getLiveChannels: async (category?: string) => {
    try {
      const filter = category
        ? `is_active = true && category = "${category}"`
        : 'is_active = true';

      const result = await pb.collection('tv_channels').getFullList<TVChannel>({
        filter,
        sort: 'name'
      });
      return result;
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      return [];
    }
  },

  getChannelsByCountry: async (country: string) => {
    return await pb.collection('tv_channels').getFullList<TVChannel>({
      filter: `is_active = true && country = "${country}"`,
      sort: 'name'
    });
  },

  // M3U Playlists
  getPlaylists: async () => {
    try {
      const result = await pb.collection('m3u_playlists').getFullList<M3UPlaylist>({
        filter: 'is_active = true',
        sort: '-created'
      });
      if (result.length > 0) return result;
      throw new Error('No playlists found');
    } catch (error) {
      return [
        { id: 'p1', name: 'My Favorites', url: '', added_by: 'user', is_active: true, channel_count: 12 },
        { id: 'p2', name: 'Sports Pack', url: '', added_by: 'user', is_active: true, channel_count: 50 },
      ] as M3UPlaylist[];
    }
  },

  addPlaylist: async (name: string, url: string, userId: string) => {
    return await pb.collection('m3u_playlists').create({
      name,
      url,
      added_by: userId,
      is_active: true
    });
  },

  updatePlaylist: async (id: string, data: Partial<M3UPlaylist>) => {
    return await pb.collection('m3u_playlists').update(id, data);
  },

  deletePlaylist: async (id: string) => {
    return await pb.collection('m3u_playlists').delete(id);
  },

  // Parse M3U8 playlist
  parseM3U8Playlist: async (url: string): Promise<TVChannel[]> => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const channels: Partial<TVChannel>[] = [];

      const lines = text.split('\n');
      let currentChannel: Partial<TVChannel> = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('#EXTINF:')) {
          // Parse channel info
          const titleMatch = line.match(/,(.+)$/);
          const logoMatch = line.match(/tvg-logo="([^"]+)"/);
          const groupMatch = line.match(/group-title="([^"]+)"/);

          currentChannel = {
            name: titleMatch ? titleMatch[1] : 'Unknown',
            logo: logoMatch ? logoMatch[1] : undefined,
            category: groupMatch ? groupMatch[1] : 'General',
            country: 'Unknown',
            language: 'en',
            is_active: true
          };
        } else if (line && !line.startsWith('#') && currentChannel.name) {
          // This is the stream URL
          currentChannel.stream_url = line;
          channels.push(currentChannel as TVChannel);
          currentChannel = {};
        }
      }

      return channels as TVChannel[];
    } catch (error) {
      console.error('Failed to parse M3U8:', error);
      return [];
    }
  },

  // Sync playlist - parse and save channels
  syncPlaylist: async (playlistId: string) => {
    try {
      const playlist = await pb.collection('m3u_playlists').getOne(playlistId);
      const channels = await mediaService.parseM3U8Playlist(playlist.url);

      // Save channels to database
      for (const channelData of channels) {
        try {
          await pb.collection('tv_channels').create({
            ...channelData,
            playlist: playlistId
          });
        } catch (err) {
          console.error('Failed to save channel:', err);
        }
      }

      // Update playlist
      await pb.collection('m3u_playlists').update(playlistId, {
        last_synced: new Date().toISOString(),
        channel_count: channels.length
      });

      return channels.length;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  },

  // CRUD Operations for Media Items
  createMediaItem: async (data: Omit<MediaItem, 'id' | 'created'>) => {
    return await pb.collection('media_items').create(data);
  },

  updateMediaItem: async (id: string, data: Partial<MediaItem>) => {
    return await pb.collection('media_items').update(id, data);
  },

  deleteMediaItem: async (id: string) => {
    return await pb.collection('media_items').delete(id);
  },

  // CRUD Operations for Channels
  createChannel: async (data: Omit<TVChannel, 'id'>) => {
    return await pb.collection('tv_channels').create(data);
  },

  updateChannel: async (id: string, data: Partial<TVChannel>) => {
    return await pb.collection('tv_channels').update(id, data);
  },

  deleteChannel: async (id: string) => {
    return await pb.collection('tv_channels').delete(id);
  }
};
