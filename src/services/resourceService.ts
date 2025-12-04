import pb from '../lib/pocketbase';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'Whitepaper' | 'Guide' | 'Webinar' | 'Asset' | 'Lesson Plan' | 'Worksheet' | 'Video' | 'Presentation';
  file?: string;
  thumbnail?: string;
  created: string;
  visibility: 'private' | 'public' | 'shared';
  views: number;
  downloads: number;
  owner_id?: string;
}

export const resourceService = {
  async getResources(type?: string, visibility: string = 'private') {
    try {
      let filter = `visibility = "${visibility}"`;
      if (type) {
        filter += ` && type = "${type}"`;
      }
      return await pb.collection('resources').getList<Resource>(1, 50, {
        sort: '-created',
        filter,
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      return { items: [], totalItems: 0 };
    }
  },

  async getSharedResources() {
    try {
      return await pb.collection('resources').getList<Resource>(1, 50, {
        sort: '-created',
        filter: 'visibility = "public" || visibility = "shared"',
      });
    } catch (error) {
      console.error('Error fetching shared resources:', error);
      return { items: [], totalItems: 0 };
    }
  },

  async createResource(data: Partial<Resource> | FormData) {
    try {
      return await pb.collection('resources').create<Resource>(data);
    } catch (error) {
      console.error('Error creating resource:', error);
      return null;
    }
  },

  async deleteResource(id: string) {
    try {
      return await pb.collection('resources').delete(id);
    } catch (error) {
      console.error('Error deleting resource:', error);
      return false;
    }
  },

  async incrementViews(id: string) {
    try {
      // We need to fetch first to get current count if we want to be atomic, 
      // but PocketBase doesn't support atomic increment easily without a custom endpoint or rule.
      // For now, we'll just update.
      const record = await pb.collection('resources').getOne<Resource>(id);
      return await pb.collection('resources').update(id, {
        views: (record.views || 0) + 1
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
      return null;
    }
  },

  async incrementDownloads(id: string) {
    try {
      const record = await pb.collection('resources').getOne<Resource>(id);
      return await pb.collection('resources').update(id, {
        downloads: (record.downloads || 0) + 1
      });
    } catch (error) {
      console.error('Error incrementing downloads:', error);
      return null;
    }
  }
};
