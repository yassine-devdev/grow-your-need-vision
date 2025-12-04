import pb from '../lib/pocketbase';

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  read_at?: string;
  attachments?: string[];
  created: string;
  expand?: {
    sender?: { name: string; avatar: string; email: string };
    recipient?: { name: string; avatar: string; email: string };
  };
}

export interface Notification {
  id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link?: string;
  created: string;
}

export interface SocialPost {
    id: string;
    platform: 'Facebook' | 'Twitter' | 'Instagram' | 'LinkedIn';
    content: string;
    scheduled_for?: string;
    status: 'Draft' | 'Scheduled' | 'Published';
    image?: string;
    likes?: number;
    comments?: number;
    shares?: number;
}

export const communicationService = {
  // Messages
  async getMessages(userId: string, type: 'inbox' | 'sent' | 'archived' | 'starred' | 'trash' = 'inbox') {
    try {
      let filter = '';
      if (type === 'inbox') {
          filter = `recipient = "${userId}" && (archived = false && trashed = false)`;
      } else if (type === 'sent') {
          filter = `sender = "${userId}" && trashed = false`;
      } else if (type === 'archived') {
          filter = `(recipient = "${userId}" || sender = "${userId}") && archived = true`;
      } else if (type === 'starred') {
          filter = `(recipient = "${userId}" || sender = "${userId}") && starred = true`;
      } else if (type === 'trash') {
          filter = `(recipient = "${userId}" || sender = "${userId}") && trashed = true`;
      }
        
      return await pb.collection('messages').getList<Message>(1, 50, {
        filter,
        sort: '-created',
        expand: 'sender,recipient',
        requestKey: null // Disable auto-cancellation
      });
    } catch (error) {
      console.warn('Failed to fetch messages:', error);
      return { items: [], totalItems: 0, totalPages: 0, page: 1, perPage: 50 };
    }
  },

  async sendMessage(data: Partial<Message>) {
    try {
      return await pb.collection('messages').create<Message>(data);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  async markMessageRead(id: string) {
    try {
      return await pb.collection('messages').update<Message>(id, {
        read_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Failed to mark message as read:', error);
      return null;
    }
  },

  // Notifications
  async getNotifications(userId: string) {
    try {
      return await pb.collection('notifications').getList<Notification>(1, 20, {
        filter: `user = "${userId}"`,
        sort: '-created',
      });
    } catch (error) {
      console.warn('Failed to fetch notifications:', error);
      return { items: [], totalItems: 0, totalPages: 0, page: 1, perPage: 20 };
    }
  },

  async markNotificationRead(id: string) {
    try {
      return await pb.collection('notifications').update<Notification>(id, {
        is_read: true,
      });
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
      return null;
    }
  },

  async markAllNotificationsRead(userId: string) {
    try {
      // Note: PocketBase doesn't support bulk update via API easily without custom endpoint or loop
      // For now, we'll fetch unread and update them (limit to recent)
      const unread = await pb.collection('notifications').getFullList({
        filter: `user = "${userId}" && is_read = false`,
      });
      
      await Promise.all(unread.map(n => 
        pb.collection('notifications').update(n.id, { is_read: true })
      ));
    } catch (error) {
      console.warn('Failed to mark all notifications as read:', error);
    }
  },

  async findUserByEmail(email: string) {
    try {
      return await pb.collection('users').getFirstListItem(`email = "${email}"`);
    } catch (error) {
      console.warn('User not found:', email);
      throw error;
    }
  },

  // Social Media
  async getSocialPosts() {
    try {
      return await pb.collection('social_posts').getList<SocialPost>(1, 50, {
          sort: '-scheduled_for'
      });
    } catch (error) {
      console.warn('Failed to fetch social posts:', error);
      return { items: [], totalItems: 0, totalPages: 0, page: 1, perPage: 50 };
    }
  },

  async createSocialPost(data: Partial<SocialPost>) {
    try {
      return await pb.collection('social_posts').create(data);
    } catch (error) {
      console.error('Failed to create social post:', error);
      throw error;
    }
  }
};
