import React, { useState } from 'react';
import { Card, Button, Icon, Badge } from '../../components/shared/ui/CommonUI';
import { Link, useNavigate } from 'react-router-dom';
import { AnalyticsDashboard } from '../owner/AnalyticsDashboard';
import { BroadcastMessageModal } from '../../components/shared/modals/BroadcastMessageModal';
import { motion } from 'framer-motion';
import { useOwnerDashboard } from '../../hooks/useOwnerDashboard';

interface OwnerDashboardProps {
    activeTab?: string;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ activeTab = 'Overview' }) => {
    const navigate = useNavigate();
    const { data: dashboardData, loading, error, refresh } = useOwnerDashboard();
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

    const modules = [
        {
            title: 'Tenant Management',
            description: 'Manage schools, subscriptions, and domains',
            icon: 'BuildingOfficeIcon',
            link: '/admin/school',
            color: 'blue'
        },
        {
            title: 'Analytics',
            description: 'Platform-wide usage and revenue stats',
            icon: 'ChartBarIcon',
            link: '/admin/dashboard/Analytics',
            color: 'green'
        },
        {
            title: 'Support',
            description: 'Handle support tickets and inquiries',
            icon: 'LifebuoyIcon',
            link: '/owner/support',
            color: 'purple'
        },
        {
            title: 'Overlay Apps',
            description: 'Manage global content for overlay apps',
            icon: 'Squares2X2Icon',
            link: '/owner/overlay-apps',
            color: 'orange'
        }
    ];

    const renderOverview = () => {
        if (loading) {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <Icon name="ArrowPathIcon" className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading dashboard data...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <Icon name="ExclamationTriangleIcon" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={() => refresh()}>Retry</Button>
                    </div>
                </div>
            );
        }

        const activeTenants = dashboardData?.kpis.activeTenants.value?.toString() || '0';
        const systemUptime = '99.9%'; // TODO: Get from system_health collection
        const mrrValue = dashboardData?.kpis.mrr.value || 42000;

        return (
            <div className="h-full flex flex-col gap-4 overflow-hidden p-2">
                {/* Header - Compact & Stylish */}
                <div className="flex items-center justify-between shrink-0 px-2">
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.35em]">Owner Control</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Platform Overview</p>
                        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
                            Super Admin Control Center
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium tracking-wide uppercase">
                            System Overview & Administration
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const data = dashboardData;
                                const csvContent = `Metric,Value\nActive Tenants,${data?.kpis.activeTenants.value}\nMRR,${data?.kpis.mrr.value}\nLTV,${data?.kpis.ltv.value}\nChurn,${data?.kpis.churn.value}\n`;
                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'owner_dashboard_export.csv';
                                a.click();
                            }}
                            className="hidden md:flex items-center gap-2"
                        >
                            <Icon name="ArrowDownTrayIcon" className="w-4 h-4" />
                            Export
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsBroadcastModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Icon name="MegaphoneIcon" className="w-4 h-4" />
                            Broadcast
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/admin/school/billing')}
                            className="flex items-center gap-2"
                        >
                            <Icon name="CreditCardIcon" className="w-4 h-4" />
                            Manage Subscription Plans
                        </Button>
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-600 tracking-wider">SYSTEM ONLINE</span>
                        </div>
                    </div>
                </div>

                {/* KPI Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                    <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-md">
                        <div className="text-xs font-bold uppercase opacity-80">Monthly Recurring Revenue</div>
                        <div className="text-3xl font-black mt-2">${mrrValue.toLocaleString()}</div>
                        <div className="text-[11px] mt-1 opacity-80">Growth engine for the platform</div>
                    </Card>
                    <Card className="p-4 shadow-sm">
                        <div className="text-xs font-bold uppercase text-gray-500">Active Tenants</div>
                        <div className="text-3xl font-black text-gray-900">{activeTenants}</div>
                        <div className="text-[11px] text-emerald-600 font-bold">+12 new this month</div>
                    </Card>
                    <Card className="p-4 shadow-sm">
                        <div className="text-xs font-bold uppercase text-gray-500">Revenue Growth Rate</div>
                        <div className="text-3xl font-black text-gray-900">+18%</div>
                        <div className="text-[11px] text-gray-500">vs last month</div>
                    </Card>
                    <Card className="p-4 shadow-sm">
                        <div className="text-xs font-bold uppercase text-gray-500">New Tenant Acquisition</div>
                        <div className="text-3xl font-black text-gray-900">42</div>
                        <div className="text-[11px] text-gray-500">Awaiting onboarding</div>
                    </Card>
                </div>

                {/* Main Bento Grid - Fixed Height, No Scroll */}
                <div className="flex-1 min-h-0 grid grid-cols-2 md:grid-cols-4 grid-rows-6 md:grid-rows-3 gap-3 md:gap-4">

                    {/* 1. Tenant Management (Top Left - Large) */}
                    <Link to="/admin/school" className="col-span-2 row-span-2 group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-500">
                        {/* Fancy Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />

                        <div className="relative h-full p-6 flex flex-col justify-between z-10">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                    <Icon name="BuildingOfficeIcon" className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{activeTenants} Active</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Tenant Management</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[80%] leading-relaxed">
                                    Manage school instances, subscriptions, domains, and onboarding pipelines.
                                </p>
                            </div>

                            {/* Mini List or Stats */}
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                    <div className="text-xs text-gray-400 uppercase font-bold">New (Month)</div>
                                    <div className="text-lg font-black text-blue-600">{dashboardData?.kpis.activeTenants.change || 0}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                    <div className="text-xs text-gray-400 uppercase font-bold">Churn Rate</div>
                                    <div className="text-lg font-black text-purple-600">{dashboardData?.kpis.churn.value || '0%'}</div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 2. Analytics (Top Middle - Tall) */}
                    <Link to="/admin/dashboard/Analytics" className="col-span-1 md:col-span-1 row-span-2 group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
                        <div className="relative h-full p-5 flex flex-col z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                    <Icon name="ChartBarIcon" className="w-5 h-5 text-emerald-600" />
                                </div>
                                <Icon name="ArrowUpRightIcon" className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">Analytics</h3>
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-auto">+24.5% Growth</p>

                            {/* Visual Chart Representation */}
                            <div className="h-32 flex items-end justify-between gap-1 mt-4">
                                {[40, 70, 45, 90, 60, 80].map((h, i) => (
                                    <div key={i} className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-md relative overflow-hidden group-hover:bg-emerald-500/10 transition-colors">
                                        <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-emerald-500 rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Link>

                    {/* 3. System Health (Top Right - Compact) */}
                    <div className="col-span-1 md:col-span-1 row-span-1 relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shadow-inner">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
                        <div className="relative h-full p-5 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Status</span>
                            </div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">{systemUptime}</div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-green-500 h-full rounded-full" style={{ width: systemUptime }} />
                            </div>
                        </div>
                    </div>

                    {/* System Alerts */}
                    <div className="col-span-2 md:col-span-1 row-span-1 relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                        <div className="p-5 h-full flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">System Alerts</div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">High API Error Rate</div>
                                </div>
                                <Badge variant="danger">Critical</Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Investigate API latency and error spikes across regions.</p>
                        </div>
                    </div>

                    {/* Simple Charts */}
                    <Card className="col-span-2 md:col-span-2 row-span-1 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-800">Revenue Growth</h3>
                            <Badge variant="success">Live</Badge>
                        </div>
                        <div className="flex items-end gap-2 h-24">
                            {[30,45,60,55,80,90].map((v,i)=> (
                                <div key={i} className="flex-1 bg-blue-100 rounded-t-md relative">
                                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-md" style={{height: `${v}%`}}></div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="col-span-2 md:col-span-2 row-span-1 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-800">New Tenant Acquisition</h3>
                            <Badge variant="neutral">Monthly</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-sm text-gray-600">
                            {['Q1','Q2','Q3','Q4'].map((label,i)=>(
                                <div key={label} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                    <div className="text-xs text-gray-400">{label}</div>
                                    <div className="font-black text-gray-800">{[12,18,24,30][i]}</div>
                                    <div className="text-[11px] text-emerald-600">+{[3,4,5,6][i]} new</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* 4. Support (Middle Right - Compact) */}
                    <Link to="/owner/support" className="col-span-1 md:col-span-1 row-span-1 group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:border-purple-500/50 transition-all">
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
                        <div className="relative h-full p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Icon name="LifebuoyIcon" className="w-6 h-6 text-purple-500" />
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">5</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Support</h3>
                                <p className="text-[10px] text-gray-500">Pending Tickets</p>
                            </div>
                        </div>
                    </Link>

                    {/* 5. Overlay Apps (Bottom Left - Wide) */}
                    <Link to="/owner/overlay-apps" className="col-span-2 md:col-span-2 row-span-1 group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative h-full p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                                    <Icon name="Squares2X2Icon" className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Overlay Apps</h3>
                                    <p className="text-xs text-gray-500">Manage global app registry & versions</p>
                                </div>
                            </div>
                            <div className="hidden md:flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        v{i}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Link>

                    {/* 6. Quick Actions (Bottom Right - Wide) */}
                    <div className="col-span-2 md:col-span-2 row-span-1 grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/admin/school')} className="group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2">
                            <Icon name="PlusCircleIcon" className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-gray-600">Add Tenant</span>
                        </button>
                        <button className="group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2">
                            <Icon name="MegaphoneIcon" className="w-6 h-6 text-pink-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-gray-600">Broadcast</span>
                        </button>
                    </div>

                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Analytics':
                return <AnalyticsDashboard />;
            case 'Market':
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                            <Icon name="ShoppingBagIcon" className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Marketplace</h2>
                        <p className="text-gray-500 max-w-md">The marketplace is currently under maintenance. Please check back later.</p>
                    </div>
                );
            case 'System':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Diagnostics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 border-l-4 border-l-green-500">
                                <h3 className="text-lg font-bold mb-2">API Services</h3>
                                <p className="text-green-600 font-mono">ONLINE (v2.4.0)</p>
                                <p className="text-xs text-gray-400 mt-2">Uptime: 99.98%</p>
                            </Card>
                            <Card className="p-6 border-l-4 border-l-blue-500">
                                <h3 className="text-lg font-bold mb-2">Database</h3>
                                <p className="text-blue-600 font-mono">CONNECTED</p>
                                <p className="text-xs text-gray-400 mt-2">Latency: 24ms</p>
                            </Card>
                            <Card className="p-6 border-l-4 border-l-purple-500">
                                <h3 className="text-lg font-bold mb-2">Storage</h3>
                                <p className="text-purple-600 font-mono">HEALTHY</p>
                                <p className="text-xs text-gray-400 mt-2">Usage: 45%</p>
                            </Card>
                        </div>
                    </div>
                );
            case 'Overview':
            default:
                return renderOverview();
        }
    };

    return (
        <div className="h-full px-6 py-4">
            {renderContent()}

            {/* Broadcast Modal */}
            <BroadcastMessageModal
                isOpen={isBroadcastModalOpen}
                onClose={() => setIsBroadcastModalOpen(false)}
                tenantCount={dashboardData?.kpis.activeTenants.value || 0}
            />
        </div>
    );
};

export default OwnerDashboard;
