import React from 'react';
import { Card, Button, Icon, Badge, Avatar } from '../shared/ui/CommonUI';

export const CDP: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Data Platform (CDP)</h2>
                <div className="flex gap-2">
                    <Button variant="secondary" icon="ArrowDownTray">Export Audience</Button>
                    <Button variant="primary" icon="PlusCircle">Add Source</Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800">
                    <div className="text-sm text-indigo-600 font-bold uppercase mb-1">Total Profiles</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">142,893</div>
                    <div className="text-xs text-green-600 flex items-center mt-1">
                        <Icon name="ArrowTrendingUpIcon" className="w-3 h-3 mr-1" /> +1,240 this week
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500 font-bold uppercase mb-1">Identity Resolved</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">94%</div>
                    <div className="text-xs text-gray-400 mt-1">High confidence matches</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500 font-bold uppercase mb-1">Data Sources</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">12</div>
                    <div className="text-xs text-gray-400 mt-1">CRM, Email, Web, Mobile...</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500 font-bold uppercase mb-1">Enrichment Rate</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">78%</div>
                    <div className="text-xs text-gray-400 mt-1">Profiles with &gt;5 attributes</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 360 View Profile Card */}
                <Card className="lg:col-span-2 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">Recent Profiles</h3>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Search profiles..." className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm px-3 py-2" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-white dark:hover:bg-gray-800 shadow-sm transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <Avatar name={i === 1 ? 'Jane Cooper' : i === 2 ? 'Wade Warren' : 'Esther Howard'} size="lg" />
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {i === 1 ? 'Jane Cooper' : i === 2 ? 'Wade Warren' : 'Esther Howard'}
                                            {i === 1 && <Badge variant="success" size="sm">VIP</Badge>}
                                        </div>
                                        <div className="text-sm text-gray-500">jane.cooper@example.com • San Francisco, CA</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">$12,400 LTV</div>
                                    <div className="text-xs text-gray-500">Last active: 2h ago</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Data Pipelines */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-6">Pipeline Health</h3>
                    <div className="space-y-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                        <div className="relative pl-10">
                            <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 z-10"></div>
                            <div className="font-bold text-sm text-gray-800 dark:text-white">Web Events Stream</div>
                            <div className="text-xs text-gray-500">Processing 1.2k events/sec</div>
                        </div>

                        <div className="relative pl-10">
                            <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 z-10"></div>
                            <div className="font-bold text-sm text-gray-800 dark:text-white">Mobile SDK</div>
                            <div className="text-xs text-gray-500">Processing 450 events/sec</div>
                        </div>

                        <div className="relative pl-10">
                            <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800 z-10"></div>
                            <div className="font-bold text-sm text-gray-800 dark:text-white">CRM Sync (Salesforce)</div>
                            <div className="text-xs text-gray-500">Syncing... (85%)</div>
                        </div>

                        <div className="relative pl-10">
                            <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 z-10"></div>
                            <div className="font-bold text-sm text-gray-800 dark:text-white">Identity Resolution</div>
                            <div className="text-xs text-gray-500">Active • 99.9% uptime</div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <Button variant="outline" className="w-full">View Pipeline Logs</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
