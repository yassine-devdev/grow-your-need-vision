import React from 'react';
import { Card, Button, Icon, Badge } from '../shared/ui/CommonUI';

export const AttributionAnalyzer: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Touch Attribution</h2>

            {/* Attribution Model Selector */}
            <Card className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                        <Icon name="PresentationChartLineIcon" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Current Model</div>
                        <div className="font-bold text-gray-900 dark:text-white text-lg">Linear (Multi-Touch)</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost">Compare Models</Button>
                    <Button variant="secondary">Configure Settings</Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Channel Performance */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-6">Channel ROI (Last 30 Days)</h3>
                    <div className="space-y-4">
                        {[
                            { channel: 'Paid Search (Google)', spend: '$12k', rev: '$48k', roi: '4.0x', width: '80%', color: 'bg-blue-500' },
                            { channel: 'Social Ads (Meta)', spend: '$8k', rev: '$24k', roi: '3.0x', width: '60%', color: 'bg-indigo-500' },
                            { channel: 'Email Marketing', spend: '$1k', rev: '$15k', roi: '15.0x', width: '95%', color: 'bg-green-500' },
                            { channel: 'Organic Search', spend: '$0', rev: '$10k', roi: '∞', width: '70%', color: 'bg-teal-500' },
                        ].map((c, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-gray-700 dark:text-gray-200">{c.channel}</span>
                                    <span className="text-gray-500">ROI: <strong className="text-gray-900 dark:text-white">{c.roi}</strong> ({c.rev} Rev)</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${c.color}`} style={{ width: c.width }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Touchpoint Journey */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-6">Top Conversion Paths</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant="neutral">Paid Search</Badge>
                            <Icon name="ArrowRightIcon" className="w-3 h-3 text-gray-400" />
                            <Badge variant="neutral">Email</Badge>
                            <Icon name="ArrowRightIcon" className="w-3 h-3 text-gray-400" />
                            <Badge variant="neutral">Direct</Badge>
                            <span className="ml-auto font-bold text-gray-700 dark:text-gray-300">24% of conv.</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant="neutral">Social Ad</Badge>
                            <Icon name="ArrowRightIcon" className="w-3 h-3 text-gray-400" />
                            <Badge variant="neutral">Checkou...</Badge>
                            <span className="ml-auto font-bold text-gray-700 dark:text-gray-300">18% of conv.</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant="neutral">Organic</Badge>
                            <Icon name="ArrowRightIcon" className="w-3 h-3 text-gray-400" />
                            <Badge variant="neutral">Retargeting</Badge>
                            <Icon name="ArrowRightIcon" className="w-3 h-3 text-gray-400" />
                            <Badge variant="neutral">Email</Badge>
                            <span className="ml-auto font-bold text-gray-700 dark:text-gray-300">12% of conv.</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
