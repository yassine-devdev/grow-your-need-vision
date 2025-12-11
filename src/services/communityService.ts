import pb from '../lib/pocketbase';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  tags: string[];
  created: string;
  expand?: {
    author?: { name: string; avatar?: string };
  };
}

export const communityService = {
  async getPosts() {
    try {
      const records = await pb.collection('community_posts').getList<Post>(1, 50, {
        sort: '-created',
        expand: 'author',
      });
      return records;
    } catch (error) {
      console.error('Failed to fetch community posts:', error);
      return { 
          items: [], 
          totalItems: 0, 
          totalPages: 0, 
          page: 1, 
          perPage: 50 
      };
    }
  },

  async createPost(data: Partial<Post>) {
    try {
      return await pb.collection('community_posts').create<Post>(data);
    } catch (error) {
      console.error('Failed to create post:', error);
      return null;
    }
  },
  
  async likePost(id: string) {
    try {
      const post = await pb.collection('community_posts').getOne<Post>(id);
      return await pb.collection('community_posts').update<Post>(id, { likes: post.likes + 1 });
    } catch (error) {
      console.error('Failed to like post:', error);
      return null;
    }
  }
};
