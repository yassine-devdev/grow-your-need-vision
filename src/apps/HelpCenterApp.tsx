import React, { useState, useEffect } from 'react';
import { Icon, Card, Button, Badge } from '../components/shared/ui/CommonUI';
import { supportService, Ticket, KnowledgeBaseArticle } from '../services/supportService';
import pb from '../lib/pocketbase';

interface HelpCenterAppProps {
  activeTab: string;
  activeSubNav: string;
}

const HelpCenterApp: React.FC<HelpCenterAppProps> = ({ activeTab, activeSubNav }) => {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'tickets' | 'create-ticket'>('home');
  
  // Ticket Form
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Ticket['priority']>('Low');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kbData, ticketData] = await Promise.all([
        supportService.getArticles(),
        supportService.getTickets()
      ]);
      setArticles(kbData.items || []);
      setTickets(ticketData.items || []);
    } catch (error) {
      console.error('Error fetching support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async () => {
    try {
      const user = pb.authStore.model;
      if (!user) return;

      await supportService.createTicket({
        subject,
        description,
        priority,
        status: 'Open',
        requester: user.id
      });

      setView('tickets');
      fetchData();
      setSubject('');
      setDescription('');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to submit ticket');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 animate-fadeIn text-gray-800 dark:text-white">
        {view === 'home' && (
          <>
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-black text-gyn-blue-dark dark:text-blue-400">How can we help you?</h1>
                <div className="relative max-w-xl mx-auto">
                    <input type="text" placeholder="Search for answers..." className="w-full px-6 py-4 rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg text-gray-800 dark:text-white" />
                    <button className="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                        <Icon name="SearchIcon" className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer p-6">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
                        <Icon name="BookOpenIcon" className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Knowledge Base</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Guides and documentation.</p>
                </Card>
                <Card className="text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer p-6" onClick={() => setView('tickets')}>
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4">
                        <Icon name="ChatBubbleLeftRight" className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">My Tickets</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View your support history.</p>
                </Card>
                <Card className="text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer p-6" onClick={() => setView('create-ticket')}>
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-4">
                        <Icon name="TicketIcon" className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Submit Ticket</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Report an issue.</p>
                </Card>
            </div>

            <Card className="p-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {loading ? (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">Loading articles...</div>
                    ) : articles.length === 0 ? (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">No articles found.</div>
                    ) : (
                        articles.map(article => (
                        <div key={article.id} className="py-4 cursor-pointer group">
                            <div className="flex justify-between items-center font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                <span>{article.title}</span>
                                <Icon name="ChevronRight" className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                    )))}
                </div>
            </Card>
          </>
        )}

        {view === 'create-ticket' && (
            <Card className="p-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('home')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><Icon name="ArrowLeft" className="w-5 h-5" /></button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit a Support Ticket</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                        <input 
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 rounded-lg text-gray-800 dark:text-white" 
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Brief summary of the issue"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                        <select 
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 rounded-lg text-gray-800 dark:text-white"
                            value={priority}
                            onChange={e => setPriority(e.target.value as any)}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea 
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 rounded-lg h-32 text-gray-800 dark:text-white" 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Detailed description of the problem..."
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSubmitTicket}>Submit Ticket</Button>
                    </div>
                </div>
            </Card>
        )}

        {view === 'tickets' && (
            <Card className="p-8">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('home')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><Icon name="ArrowLeft" className="w-5 h-5" /></button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Tickets</h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {tickets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">You haven't submitted any tickets yet.</div>
                    ) : (
                        tickets.map(ticket => (
                            <div key={ticket.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{ticket.subject}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.description.substring(0, 100)}...</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant={ticket.status === 'Open' ? 'success' : ticket.status === 'Closed' ? 'neutral' : 'warning'}>
                                            {ticket.status}
                                        </Badge>
                                        <Badge variant="outline">{ticket.priority}</Badge>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 dark:text-gray-500">
                                    {new Date(ticket.created).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        )}
    </div>
  );
};

export default HelpCenterApp;
