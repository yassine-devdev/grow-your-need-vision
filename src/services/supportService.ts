import pb from '../lib/pocketbase';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  requester: string;
  assigned_to?: string;
  created: string;
  expand?: {
    requester?: { name: string; email: string };
    assigned_to?: { name: string; email: string };
  };
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  is_published: boolean;
  created: string;
  updated: string;
}

export const supportService = {
  // Tickets
  async getTickets(userId?: string) {
    try {
      let filter = '';
      if (userId) {
        filter = `requester = "${userId}"`;
      }
      return await pb.collection('tickets').getList<Ticket>(1, 50, {
        sort: '-created',
        filter,
        expand: 'requester,assigned_to',
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return { items: [], totalItems: 0 };
    }
  },

  async createTicket(data: Partial<Ticket>) {
    try {
      return await pb.collection('tickets').create<Ticket>(data);
    } catch (error) {
      console.error('Error creating ticket:', error);
      return null;
    }
  },

  async updateTicket(id: string, data: Partial<Ticket>) {
    try {
      return await pb.collection('tickets').update<Ticket>(id, data);
    } catch (error) {
      console.error('Error updating ticket:', error);
      return null;
    }
  },

  // Knowledge Base
  async getArticles(category?: string) {
    try {
      let filter = 'is_published = true';
      if (category) {
        filter += ` && category = "${category}"`;
      }
      return await pb.collection('knowledge_base').getList<KnowledgeBaseArticle>(1, 50, {
        sort: '-created',
        filter,
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      return { items: [], totalItems: 0 };
    }
  },

  async getArticle(id: string) {
    try {
      return await pb.collection('knowledge_base').getOne<KnowledgeBaseArticle>(id);
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  },

  async createArticle(data: Partial<KnowledgeBaseArticle>) {
    try {
      return await pb.collection('knowledge_base').create<KnowledgeBaseArticle>(data);
    } catch (error) {
      console.error('Error creating article:', error);
      return null;
    }
  }
};
