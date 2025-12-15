import React from 'react';
import { Card, Button, Icon, Badge, Avatar } from '../shared/ui/CommonUI';

export const AudienceManager: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audience Segments</h2>
                <div className="flex gap-2">
                    <Button variant="secondary" icon="ArrowUpTray">Import</Button>
                    <Button variant="primary" icon="PlusCircle">Create Segment</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                    <div className="text-sm text-blue-600 font-bold uppercase mb-1">Total Contacts</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">24,592</div>
                    <div className="text-xs text-green-600 flex items-center mt-1">
                        <Icon name="ArrowTrendingUpIcon" className="w-3 h-3 mr-1" /> +12% this month
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500 font-bold uppercase mb-1">High Value</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">2,840</div>
                    <div className="text-xs text-gray-400 mt-1">LTV &gt; $500</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500 font-bold uppercase mb-1">At Risk</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">856</div>
                    <div className="text-xs text-red-500 mt-1">Churn prob &gt; 70%</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500 font-bold uppercase mb-1">New Signups</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">1,204</div>
                    <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
                    <input type="text" placeholder="Search segments..." className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm w-64" />
                    <select className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm">
                        <option>All Types</option>
                        <option>Dynamic (Rule-based)</option>
                        <option>Static (List)</option>
                    </select>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase font-bold">
                        <tr>
                            <th className="px-6 py-3">Segment Name</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Size</th>
                            <th className="px-6 py-3">Last Calculated</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {[
                            { name: 'Big Spenders', type: 'Dynamic', size: '2,840', updated: '2 hours ago' },
                            { name: 'Newsletter Subscribers', type: 'Static', size: '15,402', updated: '1 day ago' },
                            { name: 'Cart Abandoners (24h)', type: 'Dynamic', size: '342', updated: '15 mins ago' },
                            { name: 'Inactive Users (90d)', type: 'Dynamic', size: '5,100', updated: '6 hours ago' },
                            { name: 'Beta Testers', type: 'Static', size: '50', updated: '1 week ago' },
                        ].map((s, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{s.name}</td>
                                <td className="px-6 py-4"><Badge variant="neutral">{s.type}</Badge></td>
                                <td className="px-6 py-4">{s.size}</td>
                                <td className="px-6 py-4 text-gray-500">{s.updated}</td>
                                <td className="px-6 py-4">
                                    <Button size="sm" variant="ghost">Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
