import React, { useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { useDataQuery } from '../../../hooks/useDataQuery';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { DataToolbar } from '../../../components/shared/DataToolbar';
import { Badge } from '../../../components/shared/ui/Badge';
import { Button } from '../../../components/shared/ui/Button';
import { Modal } from '../../../components/shared/ui/CommonUI';
import { Input } from '../../../components/shared/ui/Input';
import { Select } from '../../../components/shared/ui/Select';
import { MetricCard } from '../../../components/shared/ui/MetricCard';
import { OwnerIcon } from '../../../components/shared/OwnerIcons';
import pb from '../../../lib/pocketbase';
import { Inquiry } from '../types';

export const ApplicationsList: React.FC = () => {
  const { showToast } = useToast();
    // Filter for application-related statuses
    const baseFilter = 'status = "Interview Scheduled" || status = "Offer Sent" || status = "Enrolled" || status = "Rejected"';
    const query = useDataQuery<Inquiry>('crm_inquiries', {
        filter: baseFilter,
        sort: '-created'
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Inquiry | null>(null);
    const [formData, setFormData] = useState<Partial<Inquiry>>({
        name: '',
        email: '',
        phone: '',
        grade_interest: '',
        status: 'Interview Scheduled',
        source: 'Website',
        notes: '',
        next_follow_up: ''
    });

    const handleSave = async () => {
  const { showToast } = useToast();
        try {
            if (selectedApplication) {
                await pb.collection('crm_inquiries').update(selectedApplication.id, formData);
            } else {
                await pb.collection('crm_inquiries').create(formData);
            }
            setIsModalOpen(false);
            setSelectedApplication(null);
            setFormData({ name: '', email: '', phone: '', grade_interest: '', status: 'Interview Scheduled', source: 'Website', notes: '', next_follow_up: '' });
            query.refresh();
        } catch (e) {
            console.error(e);
            showToast('Failed to save application', 'info');
        }
    };

    const handleEdit = (app: Inquiry) => {
        setSelectedApplication(app);
        setFormData({
            name: app.name,
            email: app.email,
            phone: app.phone,
            grade_interest: app.grade_interest,
            status: app.status,
            source: app.source,
            notes: app.notes,
            next_follow_up: app.next_follow_up
        });
        setIsModalOpen(true);
    };

    const columns: Column<Inquiry>[] = [
        { 
            header: 'Applicant Name', 
            accessor: (i: Inquiry) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {i.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">{i.name}</div>
                        <div className="text-xs text-gray-500">{i.email}</div>
                    </div>
                </div>
            ),
            sortable: true 
        },
        { header: 'Grade Applied', accessor: 'grade_interest', sortable: true },
        { 
            header: 'Application Status', 
            accessor: (i: Inquiry) => (
                <Badge variant={
                    i.status === 'Enrolled' ? 'success' : 
                    i.status === 'Rejected' ? 'danger' : 
                    i.status === 'Offer Sent' ? 'success' : 'warning'
                }>
                    {i.status}
                </Badge>
            ),
            sortable: true 
        },
        { 
            header: 'Interview/Follow-up', 
            accessor: (i: Inquiry) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <OwnerIcon name="ClockIcon" className="w-4 h-4" />
                    {i.next_follow_up ? new Date(i.next_follow_up).toLocaleDateString() : '-'}
                </div>
            ), 
            sortable: true 
        },
        {
            header: 'Actions',
            accessor: (i: Inquiry) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(i)}>
                        <OwnerIcon name="PencilIcon" className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    const handleSearch = (term: string) => {
        if (term) {
            query.setFilter(`(${baseFilter}) && (name ~ "${term}" || email ~ "${term}")`);
        } else {
            query.setFilter(baseFilter);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard 
                    label="Total Applications" 
                    value={query.items.length.toString()} 
                    subValue="+12%" 
                    trend="up"
                    icon="DocumentTextIcon"
                    color="text-blue-600"
                />
                <MetricCard 
                    label="Interviews Scheduled" 
                    value={query.items.filter(i => i.status === 'Interview Scheduled').length.toString()}
                    subValue="+5%" 
                    trend="up"
                    icon="UserGroupIcon"
                    color="text-purple-600"
                />
                <MetricCard 
                    label="Offers Sent" 
                    value={query.items.filter(i => i.status === 'Offer Sent').length.toString()}
                    subValue="+8%" 
                    trend="up"
                    icon="CheckCircleIcon"
                    color="text-green-600"
                />
                <MetricCard 
                    label="Enrolled" 
                    value={query.items.filter(i => i.status === 'Enrolled').length.toString()}
                    subValue="+3%" 
                    trend="up"
                    icon="AcademicCapIcon"
                    color="text-indigo-600"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                            <OwnerIcon name="DocumentTextIcon" className="w-5 h-5 text-blue-500" />
                            Applications Management
                        </h3>
                        <p className="text-sm text-gray-500">Track and manage student applications</p>
                    </div>
                    <Button onClick={() => {
                        setSelectedApplication(null);
                        setFormData({ name: '', email: '', phone: '', grade_interest: '', status: 'Interview Scheduled', source: 'Website', notes: '', next_follow_up: '' });
                        setIsModalOpen(true);
                    }}>
                        <OwnerIcon name="PlusCircleIcon" className="w-4 h-4 mr-2" />
                        New Application
                    </Button>
                </div>

                <DataToolbar 
                    collectionName="crm_inquiries"
                    onSearch={handleSearch}
                    onFilterChange={(filter) => query.setFilter(filter)}
                    onExport={() => {}}
                    onRefresh={query.refresh}
                    filterOptions={[
                        {
                            field: 'status',
                            label: 'Status',
                            type: 'select',
                            options: [
                                { label: 'Interview Scheduled', value: 'Interview Scheduled' },
                                { label: 'Offer Sent', value: 'Offer Sent' },
                                { label: 'Enrolled', value: 'Enrolled' },
                                { label: 'Rejected', value: 'Rejected' }
                            ]
                        }
                    ]}
                />

                <DataTable<Inquiry>
                    query={query}
                    columns={columns}
                    emptyMessage="No applications found matching your criteria."
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedApplication ? 'Edit Application' : 'New Application'}
            >
                <div className="space-y-4">
                    <Input
                        label="Applicant Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Grade Interest"
                            value={formData.grade_interest}
                            onChange={(e) => setFormData({ ...formData, grade_interest: e.target.value })}
                        >
                            <option value="9">Grade 9</option>
                            <option value="10">Grade 10</option>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                        </Select>
                        <Select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Inquiry['status'] })}
                        >
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Offer Sent">Offer Sent</option>
                            <option value="Enrolled">Enrolled</option>
                            <option value="Rejected">Rejected</option>
                        </Select>
                    </div>
                    <Input
                        label="Next Follow-up / Interview Date"
                        type="date"
                        value={formData.next_follow_up ? new Date(formData.next_follow_up).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, next_follow_up: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                        <textarea
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Application</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
