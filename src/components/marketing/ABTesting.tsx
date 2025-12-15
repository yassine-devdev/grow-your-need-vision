import React from 'react';
import { Card, Button, Icon, Badge } from '../shared/ui/CommonUI';

export const ABTesting: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">A/B Testing Framework</h2>
                <Button variant="primary" icon="PlusCircle">New Experiment</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Test 1 */}
                <Card className="p-0 overflow-hidden border-t-4 border-t-green-500">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Checkout Button Color</h3>
                            <Badge variant="success" className="animate-pulse">Running</Badge>
                        </div>
                        <p className="text-sm text-gray-500">Testing Green vs Blue button on checkout page.</p>
                        <div className="mt-4 flex gap-4 text-xs font-mono text-gray-400">
                            <span>Started: 2 days ago</span>
                            <span>Sample Size: 12,400</span>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Variant A (Control)</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 dark:text-white">2.4%</div>
                                    <div className="text-xs text-gray-500">Conv. Rate</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Variant B (Green)</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-600">3.1%</div>
                                    <div className="text-xs text-green-600">+29% Lift</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                            <div className="text-xs text-center mt-2 text-gray-500">Confidence: 94% (Need 95% to declare winner)</div>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2 text-sm">
                        <Button variant="ghost" size="sm">View Details</Button>
                        <Button variant="secondary" size="sm" className="text-red-500 hover:text-red-700">Stop</Button>
                    </div>
                </Card>

                {/* Active Test 2 */}
                <Card className="p-0 overflow-hidden border-t-4 border-t-blue-500">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Headline Copy V2</h3>
                            <Badge variant="success" className="animate-pulse">Running</Badge>
                        </div>
                        <p className="text-sm text-gray-500">"Boost Revenue" vs "Grow Sales" on Landing Page.</p>
                        <div className="mt-4 flex gap-4 text-xs font-mono text-gray-400">
                            <span>Started: 5 hours ago</span>
                            <span>Sample Size: 450</span>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                            <Icon name="ClockIcon" className="w-8 h-8 mb-2 opacity-50" />
                            <p>Collecting initial data...</p>
                            <p className="text-xs">Check back in 24 hours</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2 text-sm">
                        <Button variant="ghost" size="sm">View Details</Button>
                        <Button variant="secondary" size="sm" className="text-red-500 hover:text-red-700">Stop</Button>
                    </div>
                </Card>
            </div>

            <h3 className="font-bold text-lg mt-8 mb-4 text-gray-800 dark:text-white">Completed Experiments</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm text-left bg-white dark:bg-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 uppercase font-bold">
                        <tr>
                            <th className="px-6 py-3">Experiment Name</th>
                            <th className="px-6 py-3">Winner</th>
                            <th className="px-6 py-3">Lift</th>
                            <th className="px-6 py-3">Ended</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        <tr>
                            <td className="px-6 py-4 font-bold">Pricing Table Layout</td>
                            <td className="px-6 py-4 text-blue-600">Variant B (Horizontal)</td>
                            <td className="px-6 py-4 text-green-600 font-bold">+12.4%</td>
                            <td className="px-6 py-4 text-gray-500">Oct 24, 2024</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold">Email Subject Line</td>
                            <td className="px-6 py-4 text-gray-500">Inconclusive</td>
                            <td className="px-6 py-4 text-gray-500">0.2%</td>
                            <td className="px-6 py-4 text-gray-500">Oct 10, 2024</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
