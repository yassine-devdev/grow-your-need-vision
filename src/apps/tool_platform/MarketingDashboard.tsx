import React from 'react';
import { Card, Button, Icon, Badge, Avatar } from '../../components/shared/ui/CommonUI';

export const MarketingDashboard: React.FC = () => {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Marketing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <Icon name="MegaphoneIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white">12</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Active Campaigns</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <Icon name="CurrencyDollarIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white">$45.2k</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Total Spend</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Icon name="ArrowTrendingUpIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white">340%</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">ROI</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <Icon name="UserGroupIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-800 dark:text-white">1.2M</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Total Reach</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Campaigns Table */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-800 dark:text-white">Recent Campaigns</h3>
                        <Button size="sm" variant="primary" icon="PlusCircle">New Campaign</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3">Campaign Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Budget</th>
                                    <th className="px-6 py-3">Spent</th>
                                    <th className="px-6 py-3">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {[
                                    { name: 'Summer Sale 2025', status: 'Active', budget: 5000, spent: 1200, perf: 85 },
                                    { name: 'Back to School', status: 'Scheduled', budget: 10000, spent: 0, perf: 0 },
                                    { name: 'Brand Awareness', status: 'Active', budget: 2000, spent: 1800, perf: 92 },
                                    { name: 'Retargeting Q1', status: 'Paused', budget: 1500, spent: 450, perf: 60 },
                                ].map((c, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{c.name}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Scheduled' ? 'warning' : 'default'}>
                                                {c.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">${c.budget.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">${c.spent.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${c.perf > 80 ? 'bg-green-500' : c.perf > 50 ? 'bg-yellow-500' : 'bg-gray-400'}`} style={{ width: `${c.perf}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">{c.perf}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Asset Library Preview */}
                <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 dark:text-white">Asset Library</h3>
                        <button className="text-xs text-blue-600 font-bold hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                <Icon name="PhotoIcon" className="w-8 h-8 text-gray-300" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="secondary">Edit</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4" icon="ArrowUpTrayIcon">Upload Assets</Button>
                </Card>
            </div>
        </div>
    );
};
