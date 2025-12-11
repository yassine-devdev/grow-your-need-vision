import React, { useState, useEffect } from 'react';
import { Icon, Card, Button } from '../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';
import { helpService, FAQItem, SupportTicket, KnowledgeArticle } from '../services/helpService';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { motion } from 'framer-motion';

interface HelpCenterAppProps {
    activeTab: string;
    activeSubNav: string;
}

const HelpCenterApp: React.FC<HelpCenterAppProps> = ({ activeTab, activeSubNav }) => {
    const { user } = useAuth();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Ticket Form
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        description: '',
        category: 'Technical' as SupportTicket['category'],
        priority: 'Medium' as SupportTicket['priority']
    });

    useEffect(() => {
        loadData();
    }, [activeTab, user]);

    const loadData = async () => {
        if (!user) return;

        try {
            setLoading(true);

            if (activeTab === 'FAQ') {
                const faqData = await helpService.getAllFAQs();
                setFaqs(faqData);
            } else if (activeTab === 'My Tickets') {
                const ticketData = await helpService.getUserTickets(user.id);
                setTickets(ticketData);
            } else if (activeTab === 'Knowledge Base') {
                const articleData = await helpService.getPublishedArticles();
                setArticles(articleData);
            } else {
                // Home - load FAQs
                const faqData = await helpService.getAllFAQs();
                setFaqs(faqData.slice(0, 5)); // Top 5
            }
        } catch (error) {
            console.error('Failed to load help data: ', error);
    } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const [faqResults, articleResults] = await Promise.all([
                helpService.searchFAQs(searchQuery),
                helpService.searchArticles(searchQuery)
            ]);
            setFaqs(faqResults);
            setArticles(articleResults);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTicket = async () => {
        if (!user || !ticketForm.subject || !ticketForm.description) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await helpService.createTicket({
                user: user.id,
                ...ticketForm,
                status: 'Open'
            });

            alert('Ticket submitted successfully!');
            setTicketForm({
                subject: '',
                description: '',
                category: 'Technical',
                priority: 'Medium'
            });

            // Refresh tickets
            const ticketData = await helpService.getUserTickets(user.id);
            setTickets(ticketData);
        } catch (error) {
            console.error('Failed to create ticket:', error);
            alert('Failed to submit ticket. Please try again.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'High': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading && activeTab !== 'Home') {
        return <LoadingScreen />;
    }

    const renderHome = () => (
        <div className="max-w-4xl mx-auto spacy-8">
            {/* Search Hero */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                    How can we help you?
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Search our knowledge base or submit a support ticket
                </p>

                <div className="relative max-w-2xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        className="w-full px-6 py-4 pr-14 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg text-gray-900 dark:text-white"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
                    >
                        <Icon name="MagnifyingGlassIcon" className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card className="text-center hover:shadow-xl transition-all cursor-pointer p-6">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
                            <Icon name="BookOpenIcon" className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Knowledge Base</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Browse guides and tutorials</p>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card className="text-center hover:shadow-xl transition-all cursor-pointer p-6">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4">
                            <Icon name="ChatBubbleLeftRightIcon" className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">My Tickets</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Track your support requests</p>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card className="text-center hover:shadow-xl transition-all cursor-pointer p-6">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-4">
                            <Icon name="Sparkles" className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">AI Assistant</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get instant AI-powered help</p>
                    </Card>
                </motion.div>
            </div>

            {/* Popular FAQs */}
            <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{faq.answer}</p>
                                </div>
                                <Icon name="ChevronRightIcon" className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    );

    const renderSubmitTicket = () => (
        <div className="max-w-2xl mx-auto">
            <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Submit Support Ticket</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Subject *
                        </label>
                        <input
                            type="text"
                            className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={ticketForm.subject}
                            onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                            placeholder="Brief summary of your issue"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={ticketForm.category}
                                onChange={e => setTicketForm({ ...ticketForm, category: e.target.value as any })}
                            >
                                <option value="Technical">Technical</option>
                                <option value="Billing">Billing</option>
                                <option value="Feature Request">Feature Request</option>
                                <option value="Bug Report">Bug Report</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Priority
                            </label>
                            <select
                                className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={ticketForm.priority}
                                onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value as any })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-lg h-40 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            value={ticketForm.description}
                            onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                            placeholder="Please provide as much detail as possible..."
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button variant="primary" onClick={handleSubmitTicket} className="flex-1">
                            <Icon name="PaperAirplaneIcon" className="w-5 h-5 mr-2" />
                            Submit Ticket
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsAIModalOpen(true)}
                            className="border-purple-300 text-purple-600"
                        >
                            <Icon name="Sparkles" className="w-5 h-5 mr-2" />
                            Ask AI
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );

    const renderMyTickets = () => (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Support Tickets</h2>
                <Button variant="primary">
                    <Icon name="PlusIcon" className="w-5 h-5 mr-2" />
                    New Ticket
                </Button>
            </div>

            {tickets.length > 0 ? (
                <div className="space-y-4">
                    {tickets.map((ticket, index) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                            {ticket.subject}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                            {ticket.description}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm text-gray-500">
                                            {new Date(ticket.created).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                        {ticket.category}
                                    </span>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-16">
                    <Icon name="InboxIcon" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tickets yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't submitted any support tickets</p>
                    <Button variant="primary">Submit Your First Ticket</Button>
                </Card>
            )}
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Submit Ticket':
                return renderSubmitTicket();
            case 'My Tickets':
                return renderMyTickets();
            case 'Home':
            default:
                return renderHome();
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 animate-fadeIn">
            {renderContent()}

            {/* AI Modal */}
            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={(content) => {
                    console.log("AI Help Response:", content);
                    setIsAIModalOpen(false);
                    alert("AI generated a helpful response! (Check console)");
                }}
                title="AI Support Assistant"
                promptTemplate={`Help answer this support question: "${ticketForm.subject || '[User Question]'}"

            Context: ${ticketForm.description || 'No additional details provided'}

            Provide:
            - Clear explanation of the issue
            - Step-by-step solution
            - Related documentation links
        - Prevention tips`}
            contextData={ticketForm}
      />
        </div>
    );
};

export default HelpCenterApp;
