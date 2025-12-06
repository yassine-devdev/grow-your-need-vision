import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOwnerDashboard } from '../../hooks/useOwnerDashboard';
import { KPICard } from './components/KPICard';
import { AlertList } from './components/AlertList';
import { ActivityFeed } from './components/ActivityFeed';
import { SimpleLineChart } from './components/SimpleLineChart';
import { SegmentedBarChart } from './components/SegmentedBarChart';
import { DonutChart } from './components/DonutChart';
import { Icon, Button } from '../../components/shared/ui/CommonUI';
import { LoadingScreen } from '../../components/shared/LoadingScreen';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

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
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="primary" onClick={refresh}>Try Again</Button>
        </div>
    );
    if (!data) return null;

    return (
        <motion.div 
            className="h-full flex flex-col space-y-2 pb-2 overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header with Embedded KPIs */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-2 shrink-0 px-1">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-0.5">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600">Platform</span>
                        <span className="text-emerald-500">.</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-600 via-slate-400 to-slate-300">Overview</span>
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600/80">Super Admin Control Center</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm transition-all hover:scale-105 text-xs"
                        onClick={refresh}
                        leftIcon={<Icon name="ArrowPath" className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold border-none shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] transition-all hover:scale-105 text-xs"
                        leftIcon={<Icon name="ArrowDownTrayIcon" className="w-3 h-3" />}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Bento Grid Layout */}
            <motion.div 
                className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-[auto_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 min-h-0"
                variants={containerVariants}
            >
                
                {/* KPI Cards - Top Row */}
                <motion.div variants={itemVariants} className="lg:col-span-1 h-[85px]">
                    <KPICard kpi={data.kpis.mrr} icon="Banknotes" />
                </motion.div>
                <motion.div variants={itemVariants} className="lg:col-span-1 h-[85px]">
                    <KPICard kpi={data.kpis.activeTenants} icon="UserGroup" />
                </motion.div>
                <motion.div variants={itemVariants} className="lg:col-span-1 h-[85px]">
                    <KPICard kpi={data.kpis.ltv} icon="ChartBar" />
                </motion.div>
                <motion.div variants={itemVariants} className="lg:col-span-1 h-[85px]">
                    <KPICard kpi={data.kpis.churn} icon="ArrowPath" />
                </motion.div>

                {/* Revenue Growth - Large Feature Block */}
                <motion.div variants={itemVariants} className="lg:col-span-3 bg-white rounded-[2rem] p-6 relative overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-start mb-4 shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Revenue Trajectory</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">Monthly Recurring Revenue Growth</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select className="bg-slate-50 border-none text-slate-600 text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                                <option>Last 6 Months</option>
                                <option>Last Year</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full min-h-0 relative">
                        {/* Decorative background elements for the chart */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-50/30 to-transparent pointer-events-none" />
                        <SimpleLineChart data={data.revenueHistory} color="#10B981" height="100%" />
                    </div>
                </motion.div>

                {/* Live Feed - Right Sidebar */}
                <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-[2rem] p-6 relative overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Feed
                        </h3>
                        <span className="text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">REAL-TIME</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                        <ActivityFeed activities={data.recentActivity} />
                    </div>
                </motion.div>

                {/* Analytics Row - New */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[2rem] p-6 relative overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 min-h-[320px]">
                    <SegmentedBarChart 
                        title="Top Visited Pages" 
                        subtitle="by URL path"
                        data={data.topVisitedPages} 
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-[2rem] p-6 relative overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 min-h-[320px]">
                    <SegmentedBarChart 
                        title="Top Users Access" 
                        subtitle="by Source"
                        data={data.topUserAccess}
                        totalLabel="Total Users"
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-[2rem] p-6 relative overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 min-h-[320px]">
                    <DonutChart 
                        title="Total Expenses" 
                        data={data.expensesByCategory}
                    />
                </motion.div>

                {/* Tenant Acquisition - Bottom Left */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[2rem] p-6 relative overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <h3 className="text-lg font-bold text-slate-800">Tenant Acquisition</h3>
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        <SimpleLineChart data={data.tenantGrowth} color="#A855F7" height="100%" />
                    </div>
                </motion.div>

                {/* System Health - Bottom Middle */}
                <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-[2rem] p-6 relative overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="text-lg font-bold text-slate-800">System Health</h3>
                        <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-lg">
                            {data.alerts.filter(a => a.severity === 'critical').length} Issues
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <AlertList alerts={data.alerts} />
                    </div>
                </motion.div>

                {/* Controls - Bottom Right */}
                <motion.div variants={itemVariants} className="lg:col-span-1 bg-emerald-50/50 rounded-[2rem] p-6 relative overflow-hidden border border-emerald-100/50 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
                        <Icon name="CommandLineIcon" className="w-5 h-5 text-emerald-600" />
                        Controls
                    </h3>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        <button onClick={() => navigate('/admin/settings/configuration')} className="bg-white hover:bg-emerald-50 p-3 rounded-2xl border border-emerald-100/50 transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 text-center group/btn shadow-sm h-full">
                            <Icon name="Cog6ToothIcon" className="w-5 h-5 text-slate-400 group-hover/btn:text-emerald-600 transition-colors" />
                            <span className="text-[10px] text-slate-500 font-bold group-hover/btn:text-emerald-700">Settings</span>
                        </button>
                        <button onClick={() => navigate('/admin/tool_platform/logs')} className="bg-white hover:bg-emerald-50 p-3 rounded-2xl border border-emerald-100/50 transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 text-center group/btn shadow-sm h-full">
                            <Icon name="DocumentTextIcon" className="w-5 h-5 text-slate-400 group-hover/btn:text-emerald-600 transition-colors" />
                            <span className="text-[10px] text-slate-500 font-bold group-hover/btn:text-emerald-700">Logs</span>
                        </button>
                    </div>
                </motion.div>

            </motion.div>
        </motion.div>
    );
};

export default OwnerDashboard;
