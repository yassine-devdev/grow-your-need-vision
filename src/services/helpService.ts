import pb from '../lib/pocketbase';

export interface FAQItem {
    id: string;
    category: string;
    question: string;
    answer: string;
    views: number;
    helpful_count: number;
    order: number;
    created: string;
}

export interface SupportTicket {
    id: string;
    user: string;
    subject: string;
    description: string;
    category: 'Technical' | 'Billing' | 'Feature Request' | 'Bug Report' | 'Other';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
    assigned_to?: string;
    attachments?: string[];
    created: string;
    updated: string;
}

export interface TicketReply {
    id: string;
    ticket: string;
    user: string;
    message: string;
    is_staff: boolean;
    created: string;
}

export interface KnowledgeArticle {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    views: number;
    helpful_count: number;
    author: string;
    published: boolean;
    created: string;
    updated: string;
}

export const helpService = {
    // FAQs
    getAllFAQs: async () => {
        return await pb.collection('help_faqs').getFullList<FAQItem>({
            sort: 'order,category'
        });
    },

    getFAQsByCategory: async (category: string) => {
        return await pb.collection('help_faqs').getFullList<FAQItem>({
            filter: `category = "${category}"`,
            sort: 'order'
        });
    },

    searchFAQs: async (query: string) => {
        return await pb.collection('help_faqs').getFullList<FAQItem>({
            filter: `question ~ "${query}" || answer ~ "${query}"`,
            sort: '-helpful_count'
        });
    },

    markFAQHelpful: async (faqId: string) => {
        const faq = await pb.collection('help_faqs').getOne(faqId);
        return await pb.collection('help_faqs').update(faqId, {
            helpful_count: (faq.helpful_count || 0) + 1
        });
    },

    incrementFAQViews: async (faqId: string) => {
        const faq = await pb.collection('help_faqs').getOne(faqId);
        return await pb.collection('help_faqs').update(faqId, {
            views: (faq.views || 0) + 1
        });
    },

    // Support Tickets
    getUserTickets: async (userId: string) => {
        return await pb.collection('support_tickets').getFullList<SupportTicket>({
            filter: `user = "${userId}"`,
            sort: '-created',
            expand: 'assigned_to'
        });
    },

    createTicket: async (data: Partial<SupportTicket>) => {
        return await pb.collection('support_tickets').create(data);
    },

    updateTicket: async (id: string, data: Partial<SupportTicket>) => {
        return await pb.collection('support_tickets').update(id, data);
    },

    getTicketReplies: async (ticketId: string) => {
        return await pb.collection('ticket_replies').getFullList<TicketReply>({
            filter: `ticket = "${ticketId}"`,
            sort: 'created',
            expand: 'user'
        });
    },

    addTicketReply: async (ticketId: string, userId: string, message: string, isStaff: boolean = false) => {
        return await pb.collection('ticket_replies').create({
            ticket: ticketId,
            user: userId,
            message,
            is_staff: isStaff
        });
    },

    // Knowledge Base
    getPublishedArticles: async () => {
        return await pb.collection('knowledge_articles').getFullList<KnowledgeArticle>({
            filter: 'published = true',
            sort: '-created'
        });
    },

    getArticlesByCategory: async (category: string) => {
        return await pb.collection('knowledge_articles').getFullList<KnowledgeArticle>({
            filter: `category = "${category}" && published = true`,
            sort: '-views'
        });
    },

    searchArticles: async (query: string) => {
        return await pb.collection('knowledge_articles').getFullList<KnowledgeArticle>({
            filter: `(title ~ "${query}" || content ~ "${query}") && published = true`,
            sort: '-helpful_count'
        });
    },

    getArticleById: async (id: string) => {
        return await pb.collection('knowledge_articles').getOne<KnowledgeArticle>(id, {
            expand: 'author'
        });
    },

    incrementArticleViews: async (articleId: string) => {
        const article = await pb.collection('knowledge_articles').getOne(articleId);
        return await pb.collection('knowledge_articles').update(articleId, {
            views: (article.views || 0) + 1
        });
    },

    markArticleHelpful: async (articleId: string) => {
        const article = await pb.collection('knowledge_articles').getOne(articleId);
        return await pb.collection('knowledge_articles').update(articleId, {
            helpful_count: (article.helpful_count || 0) + 1
        });
    },

    // Statistics
    getHelpStats: async (userId: string) => {
        try {
            const [tickets, articles] = await Promise.all([
                pb.collection('support_tickets').getFullList({ filter: `user = "${userId}"` }),
                pb.collection('knowledge_articles').getFullList({ filter: 'published = true' })
            ]);

            return {
                totalTickets: tickets.length,
                openTickets: tickets.filter((t: SupportTicket) => t.status === 'Open').length,
                resolvedTickets: tickets.filter((t: SupportTicket) => t.status === 'Resolved').length,
                totalArticles: articles.length
            };
        } catch (error) {
            console.error('Failed to get help stats:', error);
            return {
                totalTickets: 0,
                openTickets: 0,
                resolvedTickets: 0,
                totalArticles: 0
            };
        }
    }
};
