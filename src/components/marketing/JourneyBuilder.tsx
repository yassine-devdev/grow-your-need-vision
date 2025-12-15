import React from 'react';
import { Card, Button, Icon } from '../shared/ui/CommonUI';

export const JourneyBuilder: React.FC = () => {
    return (
        <div className="h-[600px] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex overflow-hidden relative">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col z-10">
                <h3 className="font-bold text-sm uppercase text-gray-500 mb-4">Triggers</h3>
                <div className="space-y-2 mb-6">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg cursor-grab hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300 text-sm">
                            <Icon name="UserPlusIcon" className="w-4 h-4" /> New Signup
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg cursor-grab hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300 text-sm">
                            <Icon name="ShoppingCartIcon" className="w-4 h-4" /> Abandoned Cart
                        </div>
                    </div>
                </div>

                <h3 className="font-bold text-sm uppercase text-gray-500 mb-4">Actions</h3>
                <div className="space-y-2">
                    <div className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-grab hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 font-medium text-sm">
                            <Icon name="EnvelopeIcon" className="w-4 h-4 text-gray-500" /> Send Email
                        </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-grab hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 font-medium text-sm">
                            <Icon name="ChatBubbleLeftIcon" className="w-4 h-4 text-gray-500" /> Send SMS
                        </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-grab hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 font-medium text-sm">
                            <Icon name="ClockIcon" className="w-4 h-4 text-gray-500" /> Wait Duration
                        </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-grab hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 font-medium text-sm">
                            <Icon name="ShareIcon" className="w-4 h-4 text-gray-500" /> Split Path
                        </div>
                    </div>
                </div>
            </div>

            {/* Canvas Area (Mock) */}
            <div className="flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 relative p-8">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {/* Mock Flow */}
                <div className="flex flex-col items-center max-w-lg mx-auto space-y-8 mt-10 relative z-0">
                    <div className="w-64 p-4 bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 rounded-xl shadow-lg flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                            <Icon name="UserPlusIcon" className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-blue-900 dark:text-white">Trigger: New Signup</div>
                            <div className="text-xs text-blue-700 dark:text-blue-300">Any source</div>
                        </div>
                    </div>

                    <div className="h-8 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                    <div className="w-64 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-md flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Icon name="ClockIcon" className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Wait: 2 Days</div>
                            <div className="text-xs text-gray-500">Delay</div>
                        </div>
                    </div>

                    <div className="h-8 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                    <div className="w-64 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-md flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Icon name="EnvelopeIcon" className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Email: Welcome Series</div>
                            <div className="text-xs text-gray-500">Template: Welcome 1</div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 flex gap-2">
                    <Button variant="secondary" icon="PlayIcon">Test Run</Button>
                    <Button variant="primary" icon="CheckCircleIcon">Activate Journey</Button>
                </div>
            </div>
        </div>
    );
};
