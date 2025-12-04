import React from 'react';
import { Card, Icon } from '../../components/shared/ui/CommonUI';

export const AIAnalytics: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Total Interactions</h3>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">124,592</div>
                    <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <Icon name="ArrowTrendingUpIcon" className="w-3 h-3" /> +12% vs last week
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Avg. Response Time</h3>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">1.2s</div>
                    <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <Icon name="ArrowTrendingDownIcon" className="w-3 h-3" /> -0.3s improvement
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Cost per 1k Tokens</h3>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">$0.000</div>
                    <div className="text-xs text-gray-400 mt-1">Running Locally (Open WebUI)</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 h-80 flex flex-col">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Usage Trends</h3>
                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-400 text-sm flex-col gap-2">
                        <Icon name="ChartBarIcon" className="w-8 h-8 opacity-50" />
                        <span>[Chart Placeholder: Daily Token Usage]</span>
                        <span className="text-xs opacity-50">Data collection active via Open WebUI</span>
                    </div>
                </Card>
                <Card className="p-6 h-80 flex flex-col">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Topic Distribution</h3>
                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-400 text-sm flex-col gap-2">
                        <Icon name="PieChartIcon" className="w-8 h-8 opacity-50" />
                        <span>[Chart Placeholder: Pie Chart of Topics]</span>
                        <span className="text-xs opacity-50">Top Topics: Coding, Wellness, Scheduling</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};
