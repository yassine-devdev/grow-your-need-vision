import pb from '../lib/pocketbase';

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'Movie' | 'Series' | 'Documentary';
  genre: string;
  duration: string;
  rating: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseYear: number;
  matchScore: number; // 0-100
  created: string;
}

export const mediaService = {
  async getMedia(filter?: string) {
    try {
      return await pb.collection('media').getList<MediaItem>(1, 50, {
        sort: '-created',
        filter: filter || '',
      });
    } catch (error) {
      console.error('Error fetching media:', error);
      return { items: [], totalItems: 0 };
    }
  },

  async getFeaturedMedia() {
    try {
      // Return the first item as featured
      const result = await this.getMedia();
      return result.items[0] || null;
    } catch (error) {
      console.error('Error fetching featured media:', error);
      return null;
    }
  }
};
