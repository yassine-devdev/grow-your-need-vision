
import React, { useState, useEffect } from 'react';
import { getModuleConfig } from '../modules/registry';
import pb from '../lib/pocketbase';
import { billingService } from '../services/billingService';
import { toolService, Tool } from '../services/toolService';
import { isMockEnv } from '../utils/mockData';
import { Button, Card, Badge, Modal, Icon } from '../components/shared/ui/CommonUI';
import { MarketingDashboard } from './tool_platform/MarketingDashboard';
import { FinanceDashboard } from './tool_platform/FinanceDashboard';
import { BusinessLogic } from './tool_platform/BusinessLogic';
import { MarketplaceDashboard } from './tool_platform/MarketplaceDashboard';
import { LogsDashboard } from './tool_platform/LogsDashboard';

interface ToolPlatformProps {
    activeTab: string;
    activeSubNav: string;
}

const ToolPlatform: React.FC<ToolPlatformProps> = ({ activeTab, activeSubNav }) => {
    const [stats, setStats] = useState({
        dailyEvents: 0,
        revenue: 0,
        activeModules: 0
    });
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const navConfig = getModuleConfig();

                if (isMockEnv()) {
                    setStats({
                        dailyEvents: 12500,
                        revenue: 42500,
                        activeModules: Object.keys(navConfig.tool_platform.subnav).length
                    });
                    return;
                }

                const usersResult = await pb.collection('users').getList(1, 1);
                const userCount = usersResult.totalItems;
                const billingStats = await billingService.getBillingStats();

                setStats({
                    dailyEvents: userCount * 12,
                    revenue: billingStats.mrr,
                    activeModules: Object.keys(navConfig.tool_platform.subnav).length
                });
            } catch (e) {
                console.error("Failed to fetch stats", e);
                if (isMockEnv()) {
                    const navConfig = getModuleConfig();
                    setStats({
                        dailyEvents: 12500,
                        revenue: 42500,
                        activeModules: Object.keys(navConfig.tool_platform.subnav).length
                    });
                }
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchTools = async () => {
            setLoading(true);
            // Fetch tools based on category using toolService

            let fetchedTools: Tool[] = [];

            // Try fetching real data first
            if (activeTab === 'Marketing') fetchedTools = await toolService.getMarketingTools();
            else if (activeTab === 'Finance') fetchedTools = await toolService.getFinanceTools();

            setTools(fetchedTools);
            setLoading(false);
        };

        if (activeTab !== 'Overview') {
            fetchTools();
        }
    }, [activeTab]);

    const handleToolClick = (tool: Tool) => {
        setSelectedTool(tool);
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
            {/* Hero Tile */}
            <div className="md:col-span-2 lg:col-span-2 row-span-2 relative rounded-3xl overflow-hidden group shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
                <div className="absolute inset-0 bg-gradient-to-br from-gyn-blue-dark to-[#0a1142]"></div>
                <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-gyn-blue-medium rounded-full blur-[100px] opacity-60 animate-pulse"></div>

                <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                    <div>
                        <Badge variant="warning" className="mb-4">
                            <Icon name="BriefcaseIcon" className="w-3 h-3 mr-1" />
                            Platform Intelligence
                        </Badge>
                        <h2 className="text-4xl font-black text-white leading-tight max-w-md drop-shadow-lg">
                            Command Center
                        </h2>
                        <p className="text-blue-100 mt-4 max-w-sm leading-relaxed opacity-80">
                            Access deep analytics, configure automated workflows, and monitor real-time performance metrics.
                        </p>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <Button variant="secondary" leftIcon={<Icon name="BoltIcon" className="w-4 h-4" />}>
                            Launch Console
                        </Button>
                        <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" leftIcon={<Icon name="DocumentTextIcon" className="w-4 h-4" />}>
                            Documentation
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <Card variant="default" className="p-6 flex flex-col justify-between group hover:shadow-lg">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-gyn-blue-medium shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Icon name="ChartBarIcon" className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">{stats.dailyEvents.toLocaleString()}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Daily Events</div>
                </div>
            </Card>

            <Card variant="default" className="p-6 flex flex-col justify-between group hover:shadow-lg">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Icon name="CurrencyDollarIcon" className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">${stats.revenue.toLocaleString()}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Revenue Run Rate</div>
                </div>
            </Card>

            {/* Quick Links */}
            <div className="md:col-span-3 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {['Marketing', 'Finance', 'Business', 'Marketplace'].map((cat) => (
                    <Card key={cat} variant="flat" className="p-4 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md cursor-pointer transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm group-hover:bg-gyn-blue-medium group-hover:text-white transition-colors">
                                <Icon name={cat === 'Marketing' ? 'ShareIcon' : cat === 'Finance' ? 'CurrencyDollarIcon' : 'BriefcaseIcon'} className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-700 dark:text-gray-200">{cat}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderToolGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
                <Card
                    key={tool.id}
                    variant="default"
                    className="group hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden"
                    onClick={() => handleToolClick(tool)}
                >
                    <div className="absolute top-0 right-0 p-2">
                        <Badge variant={tool.status === 'active' ? 'success' : 'warning'} size="sm">
                            {tool.status}
                        </Badge>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shadow-inner">
                            <Icon name={tool.icon} className="w-8 h-8 text-gyn-blue-dark dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-gyn-blue-medium transition-colors">{tool.name}</h3>
                            <span className="text-xs text-gray-400 font-mono">{tool.category}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
                        {tool.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800"></div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-gyn-blue-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Open Tool <Icon name="ArrowRightIcon" className="w-3 h-3" />
                        </span>
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-20">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gyn-blue-dark dark:text-white tracking-tight">Platform Tools</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Integrated Marketing, Finance, & Business Logic</p>
                </div>
                {activeTab !== 'Overview' && (
                    <Button variant="primary" leftIcon={<Icon name="PlusCircleIcon" className="w-5 h-5" />}>
                        New {activeTab} Tool
                    </Button>
                )}
            </div>

            {activeTab === 'Overview' ? renderOverview() :
                activeTab === 'Marketing' ? <MarketingDashboard activeSubNav={activeSubNav} /> :
                    activeTab === 'Finance' ? <FinanceDashboard /> :
                        activeTab === 'Business' ? <BusinessLogic /> :
                            activeTab === 'Marketplace' ? <MarketplaceDashboard /> :
                                activeTab === 'Logs' ? <LogsDashboard /> :
                                    renderToolGrid()}

            {/* Tool Detail Modal */}
            <Modal
                isOpen={!!selectedTool}
                onClose={() => setSelectedTool(null)}
                title={selectedTool?.name || 'Tool Details'}
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setSelectedTool(null)}>Close</Button>
                        <Button variant="primary">Launch Application</Button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                            <Icon name={selectedTool?.icon || 'BriefcaseIcon'} className="w-10 h-10 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedTool?.name}</h2>
                            <Badge variant="neutral" className="mt-2">{selectedTool?.category}</Badge>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                            {selectedTool?.description}
                        </p>
                        <h3 className="text-lg font-bold mt-6 mb-2">Key Features</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                            <li>Real-time data synchronization</li>
                            <li>Advanced reporting and analytics</li>
                            <li>Multi-user collaboration support</li>
                            <li>Automated workflow triggers</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <Icon name="BoltIcon" className="w-4 h-4" />
                            Quick Actions
                        </h4>
                        <div className="flex gap-3">
                            <Button size="sm" variant="secondary">View Logs</Button>
                            <Button size="sm" variant="secondary">Settings</Button>
                            <Button size="sm" variant="secondary">Permissions</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ToolPlatform;

