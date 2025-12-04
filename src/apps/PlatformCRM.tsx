import React, { useState, useEffect } from 'react';
import { Icon, Card, Button, Badge, Avatar, Modal } from '../components/shared/ui/CommonUI';
import { DropdownMenu } from '../components/shared/ui/DropdownMenu';
import { Input } from '../components/shared/ui/Input';
import { Select } from '../components/shared/ui/Select';
import { crmService, Deal, Contact, ForecastData } from '../services/crmService';
import { tenantService, Tenant } from '../services/tenantService';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface PlatformCRMProps {
    activeTab: string;
    activeSubNav: string;
}

const PlatformCRM: React.FC<PlatformCRMProps> = ({ activeTab, activeSubNav }) => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [forecast, setForecast] = useState<ForecastData[]>([]);
    const [accounts, setAccounts] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [newDeal, setNewDeal] = useState<{
        title: string;
        value: number;
        stage: Deal['stage'];
        description: string;
        contact_name: string;
        assigned_to: string;
    }>({
        title: '',
        value: 0,
        stage: 'Lead',
        description: '',
        contact_name: '',
        assigned_to: 'u1'
    });

    const handleCreateDeal = async () => {
        if (!newDeal.title) return;

        try {
            await crmService.createDeal(newDeal);
            setIsModalOpen(false);
            // Refresh
            const result = await crmService.getDeals();
            setDeals(result);
            // Reset form
            setNewDeal({
                title: '',
                value: 0,
                stage: 'Lead',
                description: '',
                contact_name: '',
                assigned_to: 'u1'
            });
        } catch (e) {
            console.error(e);
            alert("Failed to create deal");
        }
    };

    const handleDeleteDeal = async (id: string) => {
        if (!window.confirm("Delete this deal?")) return;
        await crmService.deleteDeal(id);
        setDeals(deals.filter(d => d.id !== id));
    };

    const handleDragStart = (e: React.DragEvent, dealId: string) => {
        e.dataTransfer.setData('dealId', dealId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, stage: Deal['stage']) => {
        e.preventDefault();
        const dealId = e.dataTransfer.getData('dealId');
        if (!dealId) return;

        // Optimistic update
        const deal = deals.find(d => d.id === dealId);
        if (deal && deal.stage !== stage) {
            const updatedDeals = deals.map(d => d.id === dealId ? { ...d, stage } : d);
            setDeals(updatedDeals);

            await crmService.updateDealStage(dealId, stage);
        }
    };

    const calculateForecast = (dealsData: Deal[]) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; // Q1-Q2
        
        const data = months.map((month, index) => ({ 
            month, 
            projected: 0, 
            actual: 0 
        }));

        dealsData.forEach(deal => {
            // If no date, assume current month for simplicity or skip
            const date = deal.expected_close_date ? new Date(deal.expected_close_date) : new Date();
            const monthIndex = date.getMonth();
            
            if (monthIndex < 6) {
                // Projected: Value * Probability (default to 50% if not set)
                const prob = deal.probability !== undefined ? deal.probability : 50;
                data[monthIndex].projected += deal.value * (prob / 100);

                // Actual: Only if Closed Won / Subscribed
                if (['Closed Won', 'Subscribed'].includes(deal.stage)) {
                    data[monthIndex].actual += deal.value;
                }
            }
        });
        return data;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'Sales Pipeline') {
                    if (activeSubNav === 'Contacts') {
                        const result = await crmService.getContacts();
                        setContacts(result);
                    } else if (activeSubNav === 'Forecast') {
                        // Calculate forecast from deals
                        const dealsResult = await crmService.getDeals();
                        setDeals(dealsResult);
                        setForecast(calculateForecast(dealsResult));
                    } else {
                        // Default to Deals
                        const result = await crmService.getDeals();
                        setDeals(result);
                    }
                } else if (activeTab === 'Tenant Accounts') {
                    let filter = '';
                    if (activeSubNav === 'Active') {
                        filter = 'status = "Active"';
                    } else if (activeSubNav === 'Onboarding') {
                        filter = 'status = "Pending" || status = "Trial"';
                    }
                    const result = await tenantService.getTenants(filter);
                    setAccounts(result);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, activeSubNav]);

    const getDealsByStage = (stage: string) => {
        return deals.filter(d => d.stage === stage);
    };

    return (
        <div className="w-full h-full flex flex-col space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center shrink-0 border-b border-gray-200/50 dark:border-gray-700 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-gyn-blue-dark dark:text-white tracking-tight">Platform CRM</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Customer Relationship Management</p>
                </div>
                <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shadow-inner">
                    <button className="p-2 rounded-md bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 text-gyn-blue-dark dark:text-white">
                        <Icon name="Grid" className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400">
                        <Icon name="List" className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Kanban Board Simulation for Sales Pipeline */}
            {activeTab === 'Sales Pipeline' && (!activeSubNav || activeSubNav === 'Deals') && (
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex space-x-6 h-full min-w-max px-2">
                        {['Lead', 'Contacted', 'Demo Scheduled', 'Trial', 'Subscribed'].map((stage, idx) => {
                            const stageDeals = getDealsByStage(stage);
                            return (
                                <div key={stage} className="w-72 flex flex-col max-h-full">
                                    {/* Column Header */}
                                    <div className="mb-3 flex items-center justify-between px-1">
                                        <h3 className="font-bold text-xs text-gyn-grey dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${['bg-gray-400', 'bg-blue-400', 'bg-purple-400', 'bg-orange-400', 'bg-green-400'][idx]}`}></div>
                                            {stage}
                                        </h3>
                                        <span className="bg-gray-200/50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-200 dark:border-gray-600">{stageDeals.length}</span>
                                    </div>

                                    {/* Column Track */}
                                    <div
                                        className="flex-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/60 dark:border-gray-700 p-2 space-y-3 overflow-y-auto no-scrollbar shadow-inner"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, stage as Deal['stage'])}
                                    >
                                        {loading ? (
                                            <div className="text-center py-4 text-gray-400 text-xs">Loading...</div>
                                        ) : stageDeals.map((deal) => (
                                            <Card
                                                key={deal.id}
                                                className="p-4 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, deal.id)}
                                            >
                                                {/* Side Color Strip */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${['bg-gray-300', 'bg-blue-300', 'bg-purple-300', 'bg-orange-300', 'bg-green-300'][idx]}`}></div>

                                                <div className="flex justify-between mb-2 pl-2">
                                                    <span className="text-xs font-bold text-gyn-blue-dark dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{deal.title}</span>
                                                    <DropdownMenu
                                                        align="right"
                                                        trigger={
                                                            <button className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-400">
                                                                <Icon name="EllipsisHorizontalIcon" className="w-4 h-4" />
                                                            </button>
                                                        }
                                                        items={[
                                                            { label: 'Delete', icon: 'Trash', onClick: () => handleDeleteDeal(deal.id), danger: true }
                                                        ]}
                                                    />
                                                </div>

                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3 pl-2 leading-relaxed">{deal.description}</p>

                                                <div className="flex items-center justify-between pl-2 border-t border-gray-50 dark:border-gray-700 pt-2">
                                                    <div className="text-xs font-black text-gray-700 dark:text-gray-300">${deal.value.toLocaleString()}</div>
                                                    <div className="flex -space-x-1">
                                                        <div className="w-5 h-5 rounded-full bg-gyn-orange text-[8px] flex items-center justify-center text-white font-bold border border-white dark:border-gray-800 shadow-sm z-10">
                                                            {deal.assigned_to ? deal.assigned_to.substring(0, 2).toUpperCase() : 'UN'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}

                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-400 hover:border-gyn-blue-medium hover:text-gyn-blue-medium dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Icon name="PlusCircleIcon" className="w-3 h-3" /> Add Deal
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Contacts View */}
            {activeTab === 'Sales Pipeline' && activeSubNav === 'Contacts' && (
                <Card className="overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white">Contacts Directory</h3>
                        <Button variant="primary" size="sm">Add Contact</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Last Contact</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {contacts.map(contact => (
                                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 dark:text-white">{contact.name}</div>
                                            <div className="text-xs text-gray-400">{contact.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{contact.role}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{contact.company}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(contact.last_contact).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold text-xs">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Forecast View */}
            {activeTab === 'Sales Pipeline' && activeSubNav === 'Forecast' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-6">Revenue Forecast</h3>
                        <div className="space-y-4">
                            {Array.isArray(forecast) && forecast.map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-gray-600 dark:text-gray-300">{item.month}</span>
                                        <div className="flex gap-4">
                                            <span className="text-gray-400">Proj: ${item.projected?.toLocaleString() || 0}</span>
                                            <span className={(item.actual || 0) >= (item.projected || 0) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                                                Act: ${item.actual?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                        <div className="bg-blue-200 dark:bg-blue-900 h-full" style={{ width: `${((item.projected || 0) / 100000) * 100}%` }}></div>
                                        <div className="bg-blue-600 dark:bg-blue-500 h-full -ml-full opacity-50" style={{ width: `${((item.actual || 0) / 100000) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                            {!Array.isArray(forecast) && <div className="text-red-500">Error loading forecast data</div>}
                        </div>
                    </Card>
                    <div className="bg-gradient-to-br from-gyn-blue-dark to-blue-900 rounded-2xl shadow-lg p-8 text-white flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                            <Icon name="ArrowTrendingUpIcon" className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="text-4xl font-black mb-2">$425,000</h2>
                        <p className="text-blue-200 font-medium mb-8">Total Projected Revenue (Q1-Q2)</p>
                        <Button variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50">Download Report</Button>
                    </div>
                </div>
            )}

            {/* CRM Accounts List View */}
            {activeTab === 'Tenant Accounts' && (
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700 shadow-glass-edge p-10 text-center flex flex-col items-center justify-center h-full">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-inner mb-6">
                        <Icon name="Calculator" className="w-12 h-12 text-gyn-blue-medium dark:text-blue-400 opacity-50" />
                    </div>
                    <h3 className="text-2xl font-black text-gyn-blue-dark dark:text-white mb-2">CRM Accounts View</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                        You are viewing the <span className="font-bold text-gray-800 dark:text-white">{activeSubNav || 'All'}</span> tenant directory. Select an account to view detailed relationship history and metrics.
                    </p>

                    {/* Account List */}
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-left">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300">Accounts ({accounts.length})</h4>
                            <button className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Loading accounts...</div>
                            ) : accounts.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">No accounts found.</div>
                            ) : (
                                accounts.map(account => (
                                    <div key={account.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xs uppercase">
                                                {account.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-white text-sm">{account.name}</div>
                                                <div className="text-xs text-gray-400">{account.type} • {account.contact_email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={
                                                account.status === 'Active' ? 'success' :
                                                    account.status === 'Pending' ? 'warning' :
                                                        'default'
                                            }>
                                                {account.status}
                                            </Badge>
                                            <Icon name="ChevronRight" className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                                        </div>
                                    </div>
                                )))}
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Deal"
                footer={
                    <Button
                        variant="primary"
                        onClick={handleCreateDeal}
                    >
                        Create Deal
                    </Button>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Deal Title"
                        value={newDeal.title}
                        onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                        placeholder="e.g. Enterprise License"
                    />
                    <Input
                        label="Value ($)"
                        type="number"
                        value={newDeal.value}
                        onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                    />
                    <Select
                        label="Stage"
                        value={newDeal.stage}
                        onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as Deal['stage'] })}
                    >
                        <option value="Lead">Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Demo Scheduled">Demo Scheduled</option>
                        <option value="Trial">Trial</option>
                        <option value="Subscribed">Subscribed</option>
                    </Select>
                    <Input
                        label="Contact Name"
                        value={newDeal.contact_name}
                        onChange={(e) => setNewDeal({ ...newDeal, contact_name: e.target.value })}
                        placeholder="Primary contact person"
                    />
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-bold text-gray-700 ml-1 uppercase tracking-wide">Description</label>
                            <button
                                onClick={() => setIsAIModalOpen(true)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <Icon name="Sparkles" className="w-3 h-3" /> AI Assist
                            </button>
                        </div>
                        <Input
                            value={newDeal.description}
                            onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                            placeholder="Brief description of the opportunity"
                        />
                    </div>
                </div>
            </Modal>

            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={(content) => {
                    setNewDeal({ ...newDeal, description: content });
                    setIsAIModalOpen(false);
                }}
                title="Generate Deal Description"
                promptTemplate={`Write a professional deal description for a potential sale.
        
        Deal Title: ${newDeal.title || '[Title]'}
        Value: $${newDeal.value || 0}
        Stage: ${newDeal.stage}
        
        Include:
        - Key Requirements
        - Next Steps
        - Potential Risks`}
                contextData={{ deal: newDeal }}
            />
        </div>
    );
};

export default PlatformCRM;
