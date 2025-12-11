import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, Modal } from '../../components/shared/ui/CommonUI';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import pb from '../../lib/pocketbase';

interface SupportTicket {
    id: string;
    tenant: string;
    created_by: string;
    assigned_to?: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'new' | 'in_progress' | 'resolved' | 'closed';
    category: 'technical' | 'billing' | 'feature' | 'other';
    created: string;
    resolved_at?: string;
    expand?: any;
}

export const SupportDashboard: React.FC = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        priority: 'medium' as const,
        category: 'technical' as const
    });

    useEffect(() => {
        loadTickets();
    }, [filter]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            let filterQuery = '';
            if (filter !== 'all') filterQuery = `status = "${filter}"`;

            const result = await pb.collection('support_tickets').getList<SupportTicket>(1, 50, {
                filter: filterQuery,
                sort: '-created',
                expand: 'created_by,tenant,assigned_to'
            });

            setTickets(result.items);
        } catch (error) {
            showToast('Failed to load tickets', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!formData.subject || !formData.description) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            await pb.collection('support_tickets').create({
                ...formData,
                created_by: user?.id,
                tenant: user?.tenant || '',
                status: 'new'
            });

            showToast('Ticket created successfully!', 'success');
            setIsCreateModalOpen(false);
            setFormData({ subject: '', description: '', priority: 'medium', category: 'technical' });
            loadTickets();
        } catch (error) {
            showToast('Failed to create ticket', 'error');
        }
    };

    const updateTicketStatus = async (ticketId: string, newStatus: string) => {
        try {
            await pb.collection('support_tickets').update(ticketId, {
                status: newStatus,
                ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
            });

            showToast('Ticket updated!', 'success');
            loadTickets();
        } catch (error) {
            showToast('Failed to update ticket', 'error');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-purple-100 text-purple-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const stats = {
        total: tickets.length,
        new: tickets.filter(t => t.status === 'new').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Support Tickets</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer support requests</p>
                </div>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Icon name="PlusIcon" className="w-5 h-5 mr-2" />
                    Create Ticket
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">New</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.new}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.in_progress}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.resolved}</p>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {(['all', 'new', 'in_progress', 'resolved'] as const).map(filterOption => (
                    <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${filter === filterOption
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        {filterOption.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Tickets List */}
            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {tickets.map(ticket => (
                        <Card key={ticket.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ticket.subject}</h3>
                                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{ticket.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Category: {ticket.category}</span>
                                        <span>•</span>
                                        <span>Created: {new Date(ticket.created).toLocaleDateString()}</span>
                                        {ticket.expand?.created_by && (
                                            <>
                                                <span>•</span>
                                                <span>By: {ticket.expand.created_by.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {ticket.status === 'new' && (
                                        <Button variant="outline" size="sm" onClick={() => updateTicketStatus(ticket.id, 'in_progress')}>
                                            Start
                                        </Button>
                                    )}
                                    {ticket.status === 'in_progress' && (
                                        <Button variant="primary" size="sm" onClick={() => updateTicketStatus(ticket.id, 'resolved')}>
                                            Resolve
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>
                                        View
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {tickets.length === 0 && (
                        <Card className="p-12 text-center">
                            <Icon name="TicketIcon" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tickets found</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {filter === 'all' ? 'No support tickets yet' : `No ${filter.replace('_', ' ')} tickets`}
                            </p>
                        </Card>
                    )}
                </div>
            )}

            {/* Create Ticket Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Support Ticket"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Subject *</label>
                        <input
                            type="text"
                            className="w-full border-2 p-3 rounded-lg"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Brief description of the issue"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Description *</label>
                        <textarea
                            className="w-full border-2 p-3 rounded-lg"
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed description of the issue"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Priority</label>
                            <select
                                className="w-full border-2 p-3 rounded-lg"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Category</label>
                            <select
                                className="w-full border-2 p-3 rounded-lg"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                            >
                                <option value="technical">Technical</option>
                                <option value="billing">Billing</option>
                                <option value="feature">Feature Request</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button variant="primary" onClick={handleCreateTicket} className="flex-1">
                            Create Ticket
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
