import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOwnerDashboard } from '../../hooks/useOwnerDashboard';
import { KPICard } from './components/KPICard';
import { AlertList } from './components/AlertList';
import { ActivityFeed } from './components/ActivityFeed';
import { SimpleLineChart } from './components/SimpleLineChart';
import { Icon, Button } from '../../components/shared/ui/CommonUI';
import { LoadingScreen } from '../../components/shared/LoadingScreen';
import env from '../../config/environment';

const OwnerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data, loading, error, refresh, refreshing } = useOwnerDashboard();

    const handleExport = () => {
        if (!data) return;

        const headers = ['Metric', 'Value', 'Change', 'Change Label', 'Trend'];
        const rows = [
            [data.kpis.mrr.label, data.kpis.mrr.value, `${data.kpis.mrr.change}%`, data.kpis.mrr.changeLabel, data.kpis.mrr.trend],
            [data.kpis.activeTenants.label, data.kpis.activeTenants.value, data.kpis.activeTenants.change, data.kpis.activeTenants.changeLabel, data.kpis.activeTenants.trend],
            [data.kpis.ltv.label, data.kpis.ltv.value, `${data.kpis.ltv.change}%`, data.kpis.ltv.changeLabel, data.kpis.ltv.trend],
            [data.kpis.churn.label, data.kpis.churn.value, `${data.kpis.churn.change}%`, data.kpis.churn.changeLabel, data.kpis.churn.trend]
        ];

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `platform_overview_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><LoadingScreen /></div>;
    if (error) return (
        <div className="p-8 text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <Button variant="primary" onClick={refresh}>Try Again</Button>
        </div>
    );
    if (!data) return null;

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            {/* Header with Embedded KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8 border-b border-gray-200/50 dark:border-hud-primary/30 pb-4 relative">
                <div className="shrink-0">
                    <h1 className="text-lg md:text-3xl font-black text-gyn-blue-dark dark:text-white leading-tight tracking-tight">Platform Overview</h1>
                    <p className="text-gyn-grey dark:text-hud-primary text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium uppercase tracking-widest opacity-80">Super Admin Control Center</p>
                </div>

                {/* KPI Grid - Embedded in Header */}
                <div className="w-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x md:divide-gray-200 dark:md:divide-white/10">
                        <div className="px-4"><KPICard kpi={data.kpis.mrr} icon="Banknotes" compact={true} /></div>
                        <div className="px-4"><KPICard kpi={data.kpis.activeTenants} icon="UserGroup" compact={true} /></div>
                        <div className="px-4"><KPICard kpi={data.kpis.ltv} icon="ChartBar" compact={true} /></div>
                        <div className="px-4"><KPICard kpi={data.kpis.churn} icon="ArrowPath" compact={true} /></div>
                    </div>
                </div>

                <div className="flex gap-2 shrink-0 justify-end">
                    <Button
                        variant="ghost"
                        size="xs"
                        className="text-[10px] md:text-sm px-2 h-7 md:h-9 dark:text-hud-primary dark:hover:bg-hud-primary/10"
                        onClick={refresh}
                        leftIcon={<Icon name="ArrowPath" className={`w-3 h-3 md:w-4 md:h-4 ${refreshing ? 'animate-spin' : ''}`} />}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        size="xs"
                        className="text-[10px] md:text-sm px-2 h-7 md:h-9 bg-gray-900 hover:bg-gray-800 text-white dark:bg-hud-primary dark:text-material-obsidian dark:hover:bg-hud-secondary border-none shadow-lg shadow-gray-200/50 dark:shadow-hud-glow font-bold"
                        leftIcon={<Icon name="ArrowDownTrayIcon" className="w-3 h-3 md:w-4 md:h-4" />}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-material-gunmetal/50 backdrop-blur-xl p-6 rounded-2xl shadow-sm dark:shadow-glass border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-gyn-blue-dark to-deepBlue dark:from-material-obsidian dark:to-material-gunmetal p-3 rounded-lg shadow-md border border-white/10 relative z-10">
                            <h3 className="text-lg font-bold text-white dark:text-hud-primary flex items-center gap-2">
                                <Icon name="ChartBar" className="w-5 h-5 text-gyn-orange dark:text-hud-secondary" />
                                Revenue Growth
                            </h3>
                            <select className="text-xs border-none rounded-lg text-gyn-blue-dark dark:text-white bg-white dark:bg-white/10 font-bold focus:ring-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/20 transition-colors">
                                <option>Last 6 Months</option>
                                <option>Last Year</option>
                            </select>
                        </div>
                        <div className="relative z-10">
                            <SimpleLineChart data={data.revenueHistory} color="#00F0FF" height={250} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-material-gunmetal/50 backdrop-blur-xl p-6 rounded-2xl shadow-sm dark:shadow-glass border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-gyn-blue-dark to-deepBlue dark:from-material-obsidian dark:to-material-gunmetal p-3 rounded-lg shadow-md border border-white/10 relative z-10">
                            <h3 className="text-lg font-bold text-white dark:text-hud-primary flex items-center gap-2">
                                <Icon name="UserGroup" className="w-5 h-5 text-gyn-orange dark:text-hud-secondary" />
                                New Tenant Acquisition
                            </h3>
                            <select className="text-xs border-none rounded-lg text-gyn-blue-dark dark:text-white bg-white dark:bg-white/10 font-bold focus:ring-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/20 transition-colors">
                                <option>Last 6 Months</option>
                            </select>
                        </div>
                        <div className="relative z-10">
                            <SimpleLineChart data={data.tenantGrowth} color="#7000FF" height={200} />
                        </div>
                    </div>
                </div>

                {/* Sidebar Section */}
                <div className="space-y-6">
                    {/* Alerts */}
                    <div className="bg-white dark:bg-material-gunmetal/50 backdrop-blur-xl p-6 rounded-2xl shadow-sm dark:shadow-glass border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-gyn-blue-dark to-deepBlue dark:from-material-obsidian dark:to-material-gunmetal p-3 rounded-lg shadow-md border border-white/10">
                            <h3 className="text-lg font-bold text-white dark:text-hud-primary flex items-center gap-2">
                                <Icon name="BellAlertIcon" className="w-5 h-5 text-red-400 dark:text-red-500 animate-pulse" />
                                System Alerts
                            </h3>
                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 shadow-sm backdrop-blur-sm">
                                {data.alerts.filter(a => a.severity === 'critical').length} Critical
                            </span>
                        </div>
                        <AlertList alerts={data.alerts} />
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-material-gunmetal/50 backdrop-blur-xl p-6 rounded-2xl shadow-sm dark:shadow-glass border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-gyn-blue-dark to-deepBlue dark:from-material-obsidian dark:to-material-gunmetal p-3 rounded-lg shadow-md border border-white/10">
                            <h3 className="text-lg font-bold text-white dark:text-hud-primary flex items-center gap-2">
                                <Icon name="BoltIcon" className="w-5 h-5 text-yellow-400 dark:text-yellow-300" />
                                Live Activity
                            </h3>
                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 shadow-sm backdrop-blur-sm flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Real-time
                            </span>
                        </div>
                        <ActivityFeed activities={data.recentActivity} />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-gyn-blue-dark to-indigo-900 dark:from-material-obsidian dark:to-material-gunmetal p-6 rounded-2xl shadow-lg dark:shadow-hud-glow text-white border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                            <Icon name="CommandLineIcon" className="w-5 h-5 text-hud-primary" />
                            Platform Controls
                        </h3>
                        <div className="space-y-3 relative z-10">
                            <button
                                onClick={() => navigate('/admin/school/billing')}
                                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-hud-primary/20 rounded-xl transition-all duration-300 text-sm font-medium backdrop-blur-sm border border-white/5 hover:border-white/20 dark:hover:border-hud-primary/50 group/btn"
                            >
                                <span className="group-hover/btn:translate-x-1 transition-transform">Manage Subscription Plans</span>
                                <Icon name="ChevronRight" className="w-4 h-4 opacity-70 group-hover/btn:opacity-100" />
                            </button>
                            <button
                                onClick={() => navigate('/admin/settings/configuration')}
                                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-hud-primary/20 rounded-xl transition-all duration-300 text-sm font-medium backdrop-blur-sm border border-white/5 hover:border-white/20 dark:hover:border-hud-primary/50 group/btn"
                            >
                                <span className="group-hover/btn:translate-x-1 transition-transform">System Maintenance Mode</span>
                                <div className="w-8 h-4 bg-gray-400/50 dark:bg-white/20 rounded-full relative transition-colors group-hover/btn:bg-hud-primary/30">
                                    <div className="w-4 h-4 bg-white dark:bg-hud-primary rounded-full absolute left-0 top-0 shadow-sm transition-transform group-hover/btn:translate-x-4"></div>
                                </div>
                            </button>
                            <button
                                onClick={() => navigate('/admin/tool_platform/logs')}
                                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-hud-primary/20 rounded-xl transition-all duration-300 text-sm font-medium backdrop-blur-sm border border-white/5 hover:border-white/20 dark:hover:border-hud-primary/50 group/btn"
                            >
                                <span className="group-hover/btn:translate-x-1 transition-transform">View Audit Logs</span>
                                <Icon name="ChevronRight" className="w-4 h-4 opacity-70 group-hover/btn:opacity-100" />
                            </button>
                            <a
                                href={`${env.get('pocketbaseAdminUrl')}settings/storage`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-hud-primary/20 rounded-xl transition-all duration-300 text-sm font-medium backdrop-blur-sm border border-white/5 hover:border-white/20 dark:hover:border-hud-primary/50 group/btn"
                            >
                                <span className="group-hover/btn:translate-x-1 transition-transform">Configure MinIO Storage</span>
                                <Icon name="ServerStack" className="w-4 h-4 opacity-70 group-hover/btn:opacity-100" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
