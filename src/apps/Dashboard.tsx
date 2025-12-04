
import React from 'react';
import { Icon, Card, Badge, Button } from '../components/shared/ui/CommonUI';
import { useDashboardData } from '../hooks/useDashboardData';

interface DashboardProps {
  activeTab: string;
  activeSubNav: string;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab }) => {
  const { kpis, alerts, loading, error } = useDashboardData();

  if (loading) {
      return (
          <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gyn-blue-medium dark:border-blue-400"></div>
          </div>
      );
  }

  if (error) {
      return (
          <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              Error loading dashboard: {error}
          </div>
      );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-end justify-between border-b border-gray-200/50 dark:border-gray-700/50 pb-4 relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gyn-blue-dark to-gyn-blue-medium dark:from-blue-400 dark:to-blue-200 drop-shadow-sm">Dashboard</h1>
          <p className="text-gyn-grey dark:text-gray-400 text-sm mt-1 font-medium">System Overview & Key Performance Indicators</p>
        </div>
        <div className="text-right relative z-10">
             <Badge variant="success" className="bg-green-100/80 dark:bg-green-900/30 backdrop-blur-md border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                System Online
             </Badge>
        </div>
      </div>

      {/* KPI Cards - Glassmorphic with Glow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} variant="glass" className="relative overflow-hidden group hover:-translate-y-1 transition-all">
             <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bg} opacity-50 dark:opacity-20`}></div>
             
             <div className="relative p-5 z-10">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                    <div className="p-2 bg-white/60 dark:bg-slate-700/60 rounded-lg shadow-sm">
                        <Icon name={kpi.icon} className={`w-5 h-5 ${kpi.color} dark:text-white`} />
                    </div>
                </div>
                <div className="text-3xl font-black text-gyn-blue-dark dark:text-white tracking-tight">{kpi.value}</div>
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <span className={kpi.sub.includes('+') || kpi.sub.includes('-0') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {kpi.sub}
                    </span>
                    <span className="opacity-60">from last month</span>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
         {/* Main Chart Section - Frosted Glass Panel */}
         <Card variant="glass" className="lg:col-span-2 p-6 min-h-[350px] flex flex-col relative">
            <h3 className="text-lg font-bold text-gyn-blue-dark dark:text-white mb-4 flex items-center gap-2">
                <Icon name="PresentationChartLineIcon" className="w-5 h-5 text-gyn-blue-medium dark:text-blue-400" />
                {activeTab} Trends
            </h3>
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-gray-200/50 dark:border-slate-600/50 relative overflow-hidden group shadow-inner">
                 {/* Decorative Chart Background */}
                 <svg className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 text-gyn-blue-medium dark:text-blue-500" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L0 50 L20 60 L40 40 L60 80 L80 30 L100 0 L100 100 Z" fill="currentColor" />
                 </svg>
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-40 h-40 rounded-full bg-gyn-blue-light/50 dark:bg-blue-900/30 filter blur-3xl animate-pulse"></div>
                 </div>

                 <div className="relative z-10 text-center">
                    <Icon name="Grid" className="w-16 h-16 text-gyn-blue-medium/50 dark:text-blue-400/50 mx-auto mb-2" />
                    <p className="text-gyn-grey dark:text-gray-400 font-medium text-sm">Interactive Visualization</p>
                 </div>
            </div>
         </Card>

         {/* Alerts / Activity Feed - Neumorphic List */}
         <Card variant="glass" className="p-6 relative">
            <h3 className="text-lg font-bold text-gyn-blue-dark dark:text-white mb-4 flex items-center gap-2">
                <Icon name="BellIcon" className="w-5 h-5 text-gyn-orange dark:text-orange-400" />
                Recent Alerts
            </h3>
            <div className="space-y-3">
                {alerts.map((alert, i) => (
                    <div key={i} className={`p-4 rounded-xl ${alert.bg} dark:bg-slate-700/50 border ${alert.border} dark:border-slate-600 shadow-sm hover:shadow-md transition-all cursor-pointer group`}>
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${alert.text} dark:text-gray-300 flex items-center gap-1`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${alert.text.replace('text', 'bg')}`}></span>
                                {alert.type}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{alert.time}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mt-1 group-hover:text-black dark:group-hover:text-white transition-colors">{alert.msg}</p>
                    </div>
                ))}
            </div>
            
            <Button variant="ghost" className="w-full mt-4 text-xs font-bold text-gyn-blue-medium dark:text-blue-400">
                View All Logs
            </Button>
         </Card>
      </div>
    </div>
  );
};

export default Dashboard;
