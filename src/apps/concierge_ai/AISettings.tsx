import React from 'react';
import { Card, Button, Icon } from '../../components/shared/ui/CommonUI';

export const AISettings: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configuration</h2>
            
            <Card className="p-6 space-y-6">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Icon name="CpuChipIcon" className="w-5 h-5 text-gray-500" />
                        Model Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Model</label>
                            <select className="w-full p-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white">
                                <option>GPT-4 Turbo</option>
                                <option>GPT-3.5 Turbo</option>
                                <option>Claude 3 Opus</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</label>
                            <input type="range" min="0" max="1" step="0.1" className="w-full" />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Precise</span>
                                <span>Creative</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Icon name="ShieldCheckIcon" className="w-5 h-5 text-gray-500" />
                        Safety & Moderation
                    </h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gyn-blue-medium focus:ring-gyn-blue-medium" defaultChecked />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Filter profanity and hate speech</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gyn-blue-medium focus:ring-gyn-blue-medium" defaultChecked />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Block PII (Personally Identifiable Information)</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gyn-blue-medium focus:ring-gyn-blue-medium" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Log all conversations for audit</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="primary">Save Changes</Button>
                </div>
            </Card>
        </div>
    );
};
