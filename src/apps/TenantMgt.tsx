import React, { useState, useEffect } from 'react';
import { Icon, EmptyState } from '../components/shared/ui/CommonUI';
import { DropdownMenu } from '../components/shared/ui/DropdownMenu';
import { tenantService, Tenant } from '../services/tenantService';
import { SchoolOnboardingWizard } from './school/SchoolOnboardingWizard';
import { SchoolDetail } from './school/SchoolDetail';
import { PlatformBilling } from './school/PlatformBilling';

// UI Components
import { Heading1, Text, Caption } from '../components/shared/ui/Typography';
import { Button } from '../components/shared/ui/Button';
import { GlassCard } from '../components/shared/ui/GlassCard';
import { SearchInput } from '../components/shared/ui/SearchInput';
import { Select } from '../components/shared/ui/Select';
import { Table, Thead, Tr, Th, Td } from '../components/shared/ui/Table';
import { Badge } from '../components/shared/ui/Badge';
import { Avatar } from '../components/shared/ui/Avatar';
import { IconButton } from '../components/shared/ui/IconButton';
import { Pagination } from '../components/shared/ui/Pagination';
import { useToggle } from '../hooks/useToggle';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface TenantMgtProps {
    activeTab: string;
    activeSubNav: string;
}

const TenantMgt: React.FC<TenantMgtProps> = ({ activeTab, activeSubNav }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);
    const [isWizardOpen, toggleWizard] = useToggle(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

    // Filter & Pagination State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const handleCreateComplete = (newTenant: Tenant) => {
        setTenants([newTenant, ...tenants]);
    };

    const handleUpdateStatus = async (id: string, status: Tenant['status']) => {
        if (!window.confirm(`Are you sure you want to change status to ${status}?`)) return;

        const updated = await tenantService.updateTenantStatus(id, status);
        if (updated) {
            setTenants(tenants.map(t => t.id === id ? updated : t));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) return;

        const success = await tenantService.deleteTenant(id);
        if (success) {
            setTenants(tenants.filter(t => t.id !== id));
            if (selectedTenantId === id) setSelectedTenantId(null);
        }
    };

    useEffect(() => {
        if (activeTab === 'Platform Billing') return;

        const fetchTenants = async () => {
            setLoading(true);
            try {
                let result;
                // Fetch all tenants for now as specific methods are not implemented
                const response = await tenantService.getTenants();
                setTenants(response.items as unknown as Tenant[]);
            } catch (error) {
                console.error('Failed to fetch tenants:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTenants();
    }, [activeSubNav, activeTab]);

    // Filter Logic
    const filteredTenants = tenants.filter(tenant => {
        const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Statuses' || tenant.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    console.log(`TenantMgt: Tenants: ${tenants.length}, Filtered: ${filteredTenants.length}`); // Debug log

    // Pagination Logic
    const totalItems = filteredTenants.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedTenants = filteredTenants.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    if (selectedTenantId) {
        return <SchoolDetail tenantId={selectedTenantId} onBack={() => setSelectedTenantId(null)} />;
    }

    if (activeTab === 'Platform Billing') {
        return (
            <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
                <div className="flex items-end justify-between relative">
                    <div className="z-10">
                        <Heading1>Platform Billing</Heading1>
                        <Text variant="muted" className="mt-2 font-medium">Manage Subscriptions, Invoices, and Gateways</Text>
                    </div>
                </div>
                <PlatformBilling activeSubNav={activeSubNav} />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {/* Header Section */}
            <div className="flex items-end justify-between relative">
                <div className="z-10">
                    <Heading1>Tenant Management</Heading1>
                    <Text variant="muted" className="mt-2 font-medium">Manage Schools, Individuals, and Billing Plans</Text>
                </div>
                <Button variant="primary" size="lg" leftIcon={<Icon name="PlusCircleIcon" className="w-4 h-4" />} onClick={toggleWizard}>
                    Add New {activeSubNav || 'Tenant'}
                </Button>
            </div>

            {/* Main Glass Container */}
            <GlassCard className="min-h-[600px]">

                {/* Toolbar */}
                <div className="p-6 border-b border-white/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-white/40 to-transparent">
                    <div className="w-48">
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option>All Statuses</option>
                            <option>Active</option>
                            <option>Trial</option>
                            <option>Suspended</option>
                        </Select>
                    </div>

                    <div className="w-full md:w-80">
                        <SearchInput
                            placeholder="Search tenants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('All Statuses');
                        }}
                    >
                        Reset Filters
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAIModalOpen(true)}
                        className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                        <Icon name="Sparkles" className="w-4 h-4" />
                        AI Insights
                    </Button>
                </div>

                {/* Glass Table */}
                <div className="flex-1 overflow-x-auto relative">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading tenants...</div>
                    ) : filteredTenants.length === 0 ? (
                        <EmptyState
                            title="No Tenants Found"
                            description={`There are currently no ${activeSubNav.toLowerCase()} matching your criteria.`}
                            icon="UserGroupIcon"
                            actionLabel="Create Tenant"
                            onAction={toggleWizard}
                            className="h-full"
                        />
                    ) : (
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Tenant Name</Th>
                                    <Th>Type</Th>
                                    <Th>Status</Th>
                                    <Th>Plan</Th>
                                    <Th>Users</Th>
                                    <Th className="text-right">Actions</Th>
                                </Tr>
                            </Thead>
                            <tbody>
                                {paginatedTenants.map((tenant) => (
                                    <Tr key={tenant.id} onClick={() => setSelectedTenantId(tenant.id)} className="cursor-pointer hover:bg-white/50 transition-colors">
                                        <Td>
                                            <div className="flex items-center gap-4">
                                                <Avatar
                                                    size="md"
                                                    initials={tenant.name.substring(0, 2).toUpperCase()}
                                                    status={tenant.status === 'Active' ? 'online' : 'busy'}
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm group-hover:text-gyn-blue-dark transition-colors">
                                                        {tenant.name}
                                                    </div>
                                                    <Caption>ID: #{tenant.id.substring(0, 8)}</Caption>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>
                                            <span className="text-sm font-medium text-gray-600 bg-gray-100/50 px-3 py-1 rounded-lg border border-gray-200/50">
                                                {tenant.type}
                                            </span>
                                        </Td>
                                        <Td>
                                            <Badge variant={tenant.status === 'Suspended' ? 'danger' : 'success'}>
                                                {tenant.status}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gyn-blue-dark">{tenant.subscription_plan}</span>
                                                <Caption>Renews Monthly</Caption>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(u => (
                                                    <Avatar key={u} size="sm" initials={`U${u}`} />
                                                ))}
                                                <div className="w-8 h-8 rounded-full bg-gyn-blue-light border-2 border-white flex items-center justify-center text-[10px] font-bold text-gyn-blue-dark">+{tenant.users_count}</div>
                                            </div>
                                        </Td>
                                        <Td className="text-right">
                                            <DropdownMenu
                                                align="right"
                                                trigger={<IconButton name="EllipsisHorizontalIcon" />}
                                                items={[
                                                    {
                                                        label: 'View Details',
                                                        icon: 'Eye',
                                                        onClick: () => setSelectedTenantId(tenant.id)
                                                    },
                                                    tenant.status === 'Active' ? {
                                                        label: 'Suspend Tenant',
                                                        icon: 'Pause',
                                                        onClick: () => handleUpdateStatus(tenant.id, 'Suspended'),
                                                        danger: true
                                                    } : {
                                                        label: 'Activate Tenant',
                                                        icon: 'Play',
                                                        onClick: () => handleUpdateStatus(tenant.id, 'Active')
                                                    },
                                                    {
                                                        label: 'Delete Tenant',
                                                        icon: 'Trash',
                                                        onClick: () => handleDelete(tenant.id),
                                                        danger: true
                                                    }
                                                ]}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>

                {/* Pagination */}
                {filteredTenants.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                    />
                )}
            </GlassCard>

            {/* Onboarding Wizard */}
            <SchoolOnboardingWizard
                isOpen={isWizardOpen}
                onClose={toggleWizard}
                onComplete={handleCreateComplete}
            />

            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={(content) => {
                    console.log("Tenant Insights:", content);
                    setIsAIModalOpen(false);
                    alert("Insights Generated! (Check console)");
                }}
                title="AI Tenant Analysis"
                promptTemplate={`Analyze the current tenant list status.
        
        Total Tenants: ${tenants.length}
        Active: ${tenants.filter(t => t.status === 'Active').length}
        Suspended: ${tenants.filter(t => t.status === 'Suspended').length}
        
        Provide:
        - Health Score
        - Retention Risk Assessment
        - Growth Opportunities`}
                contextData={{ tenantCount: tenants.length }}
            />
        </div>
    );
};

export default TenantMgt;
