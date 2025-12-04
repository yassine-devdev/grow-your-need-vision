import React from 'react';
import { Card, Button, Icon, Badge } from '../../components/shared/ui/CommonUI';

export const AIOperations: React.FC = () => {
    return (
        <div className="space-y-6 animate-fadeIn h-full flex flex-col">
            {/* Health Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">System Status</h3>
                            <p className="text-green-600 font-bold mt-1">Operational</p>
                        </div>
                        <Icon name="CheckCircleIcon" className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Open WebUI (Docker):</span>
                            <span className="text-green-600 font-bold">Connected</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>PocketBase DB:</span>
                            <span className="text-green-600 font-bold">Connected</span>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Avg Latency</h3>
                            <p className="text-blue-600 font-bold mt-1">124ms</p>
                        </div>
                        <Icon name="ClockIcon" className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="mt-4 text-xs text-gray-500">Local Inference: ~450ms | Cloud: ~120ms</div>
                </Card>
                <Card className="p-6 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Moderation Queue</h3>
                            <p className="text-yellow-600 font-bold mt-1">12 Items</p>
                        </div>
                        <Icon name="ShieldExclamationIcon" className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="mt-4 text-xs text-gray-500">Requires human review</div>
                </Card>
            </div>

            {/* Moderation Queue */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="ShieldCheckIcon" className="w-5 h-5 text-gray-400" />
                        Flagged Content Review
                    </h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline">History</Button>
                        <Button size="sm" variant="primary">Review All</Button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {[
                        { user: 'User_8821', content: 'Generate a script to bypass...', reason: 'Safety Policy (Hacking)', time: '10 mins ago', severity: 'High' },
                        { user: 'User_1102', content: 'I hate you and I want to...', reason: 'Harassment', time: '25 mins ago', severity: 'Medium' },
                        { user: 'User_4491', content: 'Ignore previous instructions...', reason: 'Jailbreak Attempt', time: '1 hour ago', severity: 'Low' },
                    ].map((item, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="danger">{item.reason}</Badge>
                                    <span className="text-xs text-gray-400">{item.time}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" className="h-7 text-xs">Allow</Button>
                                    <Button size="sm" variant="primary" className="h-7 text-xs bg-red-600 hover:bg-red-700 border-red-600">Block</Button>
                                </div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300 mb-2">
                                "{item.content}"
                            </div>
                            <div className="text-xs text-gray-500">
                                Flagged by: <span className="font-bold">Automated Classifier (v2.1)</span> • User: {item.user}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
