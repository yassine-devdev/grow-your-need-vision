import React, { useState, useRef } from 'react';
import { Card, Icon, Badge, Button } from '../../components/shared/ui/CommonUI';
import {
    useContacts,
    useCreateContact,
    useUpdateContact,
    useDeleteContact,
    useContactStats,
    useImportContacts,
    useExportContacts
} from '../../hooks/useCRMContacts';
import { CRMContact } from '../../services/crmContactsService';

const ContactsManager: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
    const [formData, setFormData] = useState<Partial<CRMContact>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filters = statusFilter !== 'all' ? { status: statusFilter as any } : undefined;
    const { data: contacts, isLoading } = useContacts(filters);
    const { data: stats } = useContactStats();
    const createMutation = useCreateContact();
    const updateMutation = useUpdateContact();
    const deleteMutation = useDeleteContact();
    const importMutation = useImportContacts();
    const exportMutation = useExportContacts();

    const filteredContacts = contacts?.filter(contact => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            contact.first_name?.toLowerCase().includes(query) ||
            contact.last_name?.toLowerCase().includes(query) ||
            contact.email?.toLowerCase().includes(query) ||
            contact.company?.toLowerCase().includes(query)
        );
    });

    const handleCreate = async () => {
        try {
            await createMutation.mutateAsync(formData);
            setShowCreateModal(false);
            setFormData({});
        } catch (error) {
            alert('Failed to create contact');
        }
    };

    const handleUpdate = async () => {
        if (!editingContact) return;

        try {
            await updateMutation.mutateAsync({ id: editingContact.id, data: formData });
            setEditingContact(null);
            setFormData({});
        } catch (error) {
            alert('Failed to update contact');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            await deleteMutation.mutateAsync(id);
        } catch (error) {
            alert('Failed to delete contact');
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const csvData = e.target?.result as string;
            try {
                const result = await importMutation.mutateAsync({ csvData, createdBy: 'current-user' });
                alert(`Imported ${result.success} contacts. ${result.failed} failed.`);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (error) {
                alert('Failed to import contacts');
            }
        };
        reader.readAsText(file);
    };

    const handleExport = async () => {
        try {
            const csv = await exportMutation.mutateAsync(filters);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contacts.csv';
            a.click();
        } catch (error) {
            alert('Failed to export contacts');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'customer': return 'success';
            case 'prospect': return 'info';
            case 'lead': return 'warning';
            case 'inactive': return 'neutral';
            default: return 'neutral';
        }
    };

    const openCreateModal = () => {
        setFormData({ status: 'lead' });
        setShowCreateModal(true);
    };

    const openEditModal = (contact: CRMContact) => {
        setEditingContact(contact);
        setFormData(contact);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your CRM contacts</p>
                </div>
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleImport}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importMutation.isPending}
                    >
                        <Icon name="ArrowUpTrayIcon" className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={exportMutation.isPending}
                    >
                        <Icon name="ArrowDownTrayIcon" className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="primary" size="sm" onClick={openCreateModal}>
                        <Icon name="PlusIcon" className="w-4 h-4 mr-2" />
                        New Contact
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="p-4 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Leads</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.by_status.lead || 0}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Prospects</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.by_status.prospect || 0}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Customers</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.by_status.customer || 0}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Recent (30d)</p>
                    <p className="text-2xl font-bold text-purple-600">{stats?.recent || 0}</p>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Icon name="MagnifyingGlassIcon" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search contacts..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="lead">Leads</option>
                        <option value="prospect">Prospects</option>
                        <option value="customer">Customers</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </Card>

            {/* Contacts List */}
            <div className="space-y-3">
                {filteredContacts?.map((contact) => (
                    <Card key={contact.id} className="p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {contact.first_name?.[0]}{contact.last_name?.[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                            {contact.first_name} {contact.last_name}
                                        </h3>
                                        <Badge variant={getStatusColor(contact.status)}>
                                            {contact.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Icon name="EnvelopeIcon" className="w-4 h-4" />
                                            {contact.email}
                                        </span>
                                        {contact.phone && (
                                            <span className="flex items-center gap-1">
                                                <Icon name="PhoneIcon" className="w-4 h-4" />
                                                {contact.phone}
                                            </span>
                                        )}
                                        {contact.company && (
                                            <span className="flex items-center gap-1">
                                                <Icon name="BuildingOfficeIcon" className="w-4 h-4" />
                                                {contact.company}
                                            </span>
                                        )}
                                    </div>
                                    {contact.title && (
                                        <p className="text-sm text-gray-500 mt-1">{contact.title}</p>
                                    )}
                                    {contact.tags && contact.tags.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {contact.tags.map((tag, idx) => (
                                                <span key={idx} className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditModal(contact)}
                                >
                                    <Icon name="PencilIcon" className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(contact.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Icon name="TrashIcon" className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredContacts?.length === 0 && (
                    <Card className="p-12 text-center">
                        <Icon name="UserGroupIcon" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No contacts found</p>
                        <Button variant="primary" size="sm" onClick={openCreateModal} className="mt-4">
                            Create your first contact
                        </Button>
                    </Card>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingContact) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">
                            {editingContact ? 'Edit Contact' : 'New Contact'}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.first_name || ''}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.last_name || ''}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={formData.company || ''}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status *
                            </label>
                            <select
                                value={formData.status || 'lead'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                <option value="lead">Lead</option>
                                <option value="prospect">Prospect</option>
                                <option value="customer">Customer</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingContact(null);
                                    setFormData({});
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={editingContact ? handleUpdate : handleCreate}
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="flex-1"
                            >
                                {editingContact ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ContactsManager;
