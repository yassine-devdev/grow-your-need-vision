import { BaseService, ListParams, CreateParams, UpdateParams, FilterParams } from './BaseService';
import { pb } from '../lib/pocketbase';

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
  updated: string;
  featured?: boolean;
  tags?: string[];
  director?: string;
  cast?: string[];
  language?: string;
  subtitles?: string[];
  videoUrl?: string;
  trailerUrl?: string;
}

export interface CreateMediaData {
  title: string;
  description: string;
  type: MediaItem['type'];
  genre: string;
  duration: string;
  rating: string;
  releaseYear: number;
  featured?: boolean;
  tags?: string[];
  director?: string;
  cast?: string[];
  language?: string;
  subtitles?: string[];
  videoUrl?: string;
  trailerUrl?: string;
}

export interface UpdateMediaData extends Partial<CreateMediaData> {
  posterUrl?: string;
  backdropUrl?: string;
  matchScore?: number;
}

class MediaService extends BaseService<MediaItem> {
  constructor() {
    super('media');
  }

  /**
   * Get media with advanced filtering
   */
  async getMedia(params: ListParams = {}): Promise<MediaItem[]> {
    const result = await this.list(params);
    return result.data;
  }

  /**
   * Get featured media
   */
  async getFeaturedMedia(limit: number = 5): Promise<MediaItem[]> {
    const result = await this.list({
      filter: 'featured = true',
      sort: '-matchScore',
      limit
    });
    return result.data;
  }

  /**
   * Get media by type
   */
  async getMediaByType(type: MediaItem['type'], params: ListParams = {}): Promise<MediaItem[]> {
    const result = await this.list({
      ...params,
      filter: params.filter ? `(${params.filter}) && (type = "${type}")` : `type = "${type}"`
    });
    return result.data;
  }

  /**
   * Get media by genre
   */
  async getMediaByGenre(genre: string, params: ListParams = {}): Promise<MediaItem[]> {
    const result = await this.list({
      ...params,
      filter: params.filter ? `(${params.filter}) && (genre = "${genre}")` : `genre = "${genre}"`
    });
    return result.data;
  }

  /**
   * Search media
   */
  async searchMedia(query: string, params: ListParams = {}): Promise<MediaItem[]> {
    const result = await this.search(query, params);
    return result.data;
  }

  /**
   * Create new media item
   */
  async createMedia(params: CreateParams<CreateMediaData>): Promise<MediaItem> {
    this.validate(params.data);
    return this.create(params);
  }

  /**
   * Update media item
   */
  async updateMedia(params: UpdateParams<UpdateMediaData>): Promise<MediaItem> {
    this.validate(params.data);
    return this.update(params);
  }

  /**
   * Delete media item
   */
  async deleteMedia(id: string): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Get recommended media based on user preferences
   */
  async getRecommendedMedia(userId: string, limit: number = 10): Promise<MediaItem[]> {
    // This would typically involve user preferences and viewing history
    // For now, return high match score media
    const result = await this.list({
      filter: 'matchScore >= 70',
      sort: '-matchScore',
      limit
    });
    return result.data;
  }

  /**
   * Get trending media
   */
  async getTrendingMedia(days: number = 7, limit: number = 10): Promise<MediaItem[]> {
    // This would typically involve view counts and recent activity
    const result = await this.list({
      sort: '-matchScore',
      limit
    });
    return result.data;
  }

  /**
   * Get related media
   */
  async getRelatedMedia(mediaId: string, limit: number = 5): Promise<MediaItem[]> {
    try {
      const media = await this.getOne(mediaId);
      const result = await this.list({
        filter: `id != "${mediaId}" && (genre = "${media.genre}" || type = "${media.type}")`,
        sort: '-matchScore',
        limit
      });
      return result.data;
    } catch (error) {
      return [];
    }
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string): Promise<MediaItem> {
    const media = await this.getOne(id);
    return this.update({
      id,
      data: { featured: !media.featured }
    });
  }

  /**
   * Update match score
   */
  async updateMatchScore(id: string, score: number): Promise<MediaItem> {
    if (score < 0 || score > 100) {
      throw new Error('Match score must be between 0 and 100');
    }
    return this.update({
      id,
      data: { matchScore: score }
    });
  }

  /**
   * Get media statistics
   */
  async getMediaStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byGenre: Record<string, number>;
    featured: number;
  }> {
    try {
      const [total, featured, allMedia] = await Promise.all([
        this.count(),
        this.count({ filter: 'featured = true' }),
        this.list({ limit: 1000 }) // Get all for stats calculation
      ]);

      const byType: Record<string, number> = {};
      const byGenre: Record<string, number> = {};

      allMedia.data.forEach(media => {
        byType[media.type] = (byType[media.type] || 0) + 1;
        byGenre[media.genre] = (byGenre[media.genre] || 0) + 1;
      });

      return {
        total,
        byType,
        byGenre,
        featured
      };
    } catch (error) {
      return {
        total: 0,
        byType: {},
        byGenre: {},
        featured: 0
      };
    }
  }

  /**
   * Validate media data
   */
  protected validate(data: Record<string, any>): void {
    if (!data.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!data.description?.trim()) {
      throw new Error('Description is required');
    }
    if (!data.type || !['Movie', 'Series', 'Documentary'].includes(data.type)) {
      throw new Error('Valid type is required');
    }
    if (!data.genre?.trim()) {
      throw new Error('Genre is required');
    }
    if (!data.duration?.trim()) {
      throw new Error('Duration is required');
    }
    if (!data.rating?.trim()) {
      throw new Error('Rating is required');
    }
    if (!data.releaseYear || data.releaseYear < 1900 || data.releaseYear > new Date().getFullYear() + 5) {
      throw new Error('Valid release year is required');
    }
  }

  /**
   * Get searchable fields
   */
  protected getSearchableFields(): string[] {
    return ['title', 'description', 'genre', 'director', 'cast', 'tags'];
  }

  /**
   * Transform data before sending to API
   */
  protected transformData(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      cast: Array.isArray(data.cast) ? data.cast.join(', ') : data.cast,
      tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags,
      subtitles: Array.isArray(data.subtitles) ? data.subtitles.join(', ') : data.subtitles
    };
  }

  /**
   * Transform data after receiving from API
   */
  protected transformResponse(data: MediaItem): MediaItem {
    return {
      ...data,
      cast: data.cast ? (typeof data.cast === 'string' ? data.cast.split(', ').filter(Boolean) : data.cast) : [],
      tags: data.tags ? (typeof data.tags === 'string' ? data.tags.split(', ').filter(Boolean) : data.tags) : [],
      subtitles: data.subtitles ? (typeof data.subtitles === 'string' ? data.subtitles.split(', ').filter(Boolean) : data.subtitles) : []
    };
  }
}

export const mediaService = new MediaService();

// Legacy compatibility
export const legacyMediaService = {
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
      const result = await mediaService.getFeaturedMedia(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching featured media:', error);
      return null;
    }
  }
};
