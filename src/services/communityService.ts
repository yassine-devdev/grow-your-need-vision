import pb from '../lib/pocketbase';
import { isMockEnv } from '../utils/mockData';

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

const mockPosts: Post[] = [
  {
    id: 'mock-post-1',
    title: 'Feature Request: Dark Mode',
    content: 'We should prioritize dark mode for better night-time usability.',
    author: 'Owner User',
    likes: 12,
    tags: ['feature', 'ui'],
    created: new Date().toISOString(),
  },
  {
    id: 'mock-post-2',
    title: 'Bug Report: Attendance Sync',
    content: 'Attendance data is occasionally delayed for School B.',
    author: 'School Admin',
    likes: 4,
    tags: ['bug', 'integration'],
    created: new Date().toISOString(),
  },
];

export const communityService = {
  async getPosts() {
    // Provide deterministic mock data in e2e/mock environments
    if (isMockEnv()) {
      return {
        items: mockPosts,
        totalItems: mockPosts.length,
        totalPages: 1,
        page: 1,
        perPage: mockPosts.length,
      };
    }

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
        perPage: 50,
      };
    }
  },

  async createPost(data: Partial<Post>) {
    if (isMockEnv()) {
      const newPost: Post = {
        id: `mock-post-${mockPosts.length + 1}`,
        title: data.title || 'Untitled',
        content: data.content || '',
        author: data.author || 'Owner User',
        likes: 0,
        tags: data.tags || [],
        created: new Date().toISOString(),
      };
      mockPosts.unshift(newPost);
      return newPost;
    }

    try {
      return await pb.collection('community_posts').create<Post>(data);
    } catch (error) {
      console.error('Failed to create post:', error);
      return null;
    }
  },
  
  async likePost(id: string) {
    if (isMockEnv()) {
      const post = mockPosts.find(p => p.id === id);
      if (!post) return null;
      post.likes += 1;
      return post;
    }

    try {
      const post = await pb.collection('community_posts').getOne<Post>(id);
      return await pb.collection('community_posts').update<Post>(id, { likes: post.likes + 1 });
    } catch (error) {
      console.error('Failed to like post:', error);
      return null;
    }
  }
};
