/**
 * Base Service Class
 * Provides common functionality for all services including:
 * - Error handling
 * - Request/response interceptors
 * - Caching
 * - Logging
 * - Type safety
 */

import pb, { PocketBase } from '../lib/pocketbase';
import { errorHandler, AppError } from './errorHandler';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface CreateParams {
  data: Record<string, any>;
  files?: Record<string, File>;
}

export interface UpdateParams {
  id: string;
  data: Record<string, any>;
  files?: Record<string, File>;
}

export interface FilterParams {
  filter?: string;
  expand?: string;
  fields?: string;
}

export type ListParams = PaginationParams & FilterParams;

export abstract class BaseService<T extends Record<string, any>> {
  protected collectionName: string;
  protected pb: PocketBase;
  protected cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  
  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.pb = pb;
  }

  /**
   * Get collection instance
   */
  protected get collection() {
    return this.pb.collection(this.collectionName);
  }

  /**
   * Handle errors consistently
   */
  protected handleError(error: unknown): never {
    throw errorHandler.handle(error);
  }

  /**
   * Log service operations
   */
  protected log(operation: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.constructor.name}] ${operation}`, data);
    }
  }

  /**
   * Cache helper methods
   */
  protected getCacheKey(key: string): string {
    return `${this.collectionName}:${key}`;
  }

  protected getFromCache(key: string): any | null {
    const cached = this.cache.get(this.getCacheKey(key));
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(this.getCacheKey(key));
      return null;
    }

    return cached.data;
  }

  protected setCache(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(this.getCacheKey(key), {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  protected clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * List items with pagination and filtering
   */
  async list(params: ListParams = {}): Promise<ApiResponse<T>> {
    try {
      this.log('list', params);

      const cacheKey = JSON.stringify(params);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const {
        page = 1,
        limit = 20,
        sort = '-created',
        filter = '',
        expand = '',
        fields = ''
      } = params;

      const result = await this.collection.getList<T>(page, limit, {
        sort,
        filter,
        expand,
        fields
      });

      const response: ApiResponse<T> = {
        data: result.items,
        total: result.totalItems,
        page: result.page,
        perPage: result.perPage,
        totalPages: result.totalPages
      };

      this.setCache(cacheKey, response);
      return response;

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get single item by ID
   */
  async getOne(id: string, params: FilterParams = {}): Promise<T> {
    try {
      this.log('getOne', { id, params });

      const cacheKey = `getOne:${id}:${JSON.stringify(params)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { expand = '', fields = '' } = params;

      const result = await this.collection.getOne<T>(id, {
        expand,
        fields
      });

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Create new item
   */
  async create(params: CreateParams): Promise<T> {
    try {
      this.log('create', params);
      this.clearCache(); // Clear cache on create

      const { data, files } = params;

      let result: T;
      if (files && Object.keys(files).length > 0) {
        result = await this.collection.create<T>(data, files);
      } else {
        result = await this.collection.create<T>(data);
      }

      return result;

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update existing item
   */
  async update(params: UpdateParams): Promise<T> {
    try {
      this.log('update', params);
      this.clearCache(); // Clear cache on update

      const { id, data, files } = params;

      let result: T;
      if (files && Object.keys(files).length > 0) {
        result = await this.collection.update<T>(id, data, files);
      } else {
        result = await this.collection.update<T>(id, data);
      }

      return result;

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete item
   */
  async delete(id: string): Promise<boolean> {
    try {
      this.log('delete', { id });
      this.clearCache(); // Clear cache on delete

      await this.collection.delete(id);
      return true;

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Batch delete items
   */
  async batchDelete(ids: string[]): Promise<boolean> {
    try {
      this.log('batchDelete', { ids });
      this.clearCache(); // Clear cache on batch delete

      const promises = ids.map(id => this.collection.delete(id));
      await Promise.all(promises);
      return true;

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Search items
   */
  async search(query: string, params: ListParams = {}): Promise<ApiResponse<T>> {
    try {
      this.log('search', { query, params });

      const searchFilter = this.buildSearchFilter(query);
      const finalParams = {
        ...params,
        filter: params.filter ? `(${params.filter}) && (${searchFilter})` : searchFilter
      };

      return this.list(finalParams);

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Build search filter (override in subclasses)
   */
  protected buildSearchFilter(query: string): string {
    const searchableFields = this.getSearchableFields();
    if (searchableFields.length === 0) return '';

    const conditions = searchableFields.map(field => `${field} ~ "${query}"`);
    return `(${conditions.join(' || ')})`;
  }

  /**
   * Get searchable fields (override in subclasses)
   */
  protected getSearchableFields(): string[] {
    return ['title', 'name', 'description'];
  }

  /**
   * Get first item matching criteria
   */
  async getFirst(params: ListParams = {}): Promise<T | null> {
    try {
      const result = await this.list({ ...params, limit: 1 });
      return result.data[0] || null;

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Check if item exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      await this.getOne(id, { fields: 'id' });
      return true;

    } catch (error) {
      if (errorHandler.handle(error).statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Count items
   */
  async count(params: FilterParams = {}): Promise<number> {
    try {
      this.log('count', params);

      const cacheKey = `count:${JSON.stringify(params)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { filter = '' } = params;

      // PocketBase doesn't have a direct count method, so we use getList with limit 1
      const result = await this.collection.getList(1, 1, {
        filter,
        fields: 'id'
      });

      const count = result.totalItems;
      this.setCache(cacheKey, count, 60000); // 1 minute cache for counts
      return count;

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Real-time subscription
   */
  subscribe(callback: (data: any) => void): () => void {
    this.log('subscribe');

    // Unsubscribe function
    const unsubscribe = this.pb.collection(this.collectionName).subscribe('*', (e) => {
      this.log('subscription_event', e);
      this.clearCache(); // Clear cache on real-time updates
      callback(e);
    });

    return unsubscribe;
  }

  /**
   * Validate data before create/update
   */
  protected validate(data: Record<string, any>): void {
    // Override in subclasses for custom validation
  }

  /**
   * Transform data before sending to API
   */
  protected transformData(data: Record<string, any>): Record<string, any> {
    // Override in subclasses for custom transformations
    return data;
  }

  /**
   * Transform data after receiving from API
   */
  protected transformResponse(data: T): T {
    // Override in subclasses for custom transformations
    return data;
  }
}