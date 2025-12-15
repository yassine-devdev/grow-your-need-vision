import React from 'react';
import { Card, Button, Icon, Badge } from '../shared/ui/CommonUI';

export const CreativeStudio: React.FC = () => {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Creative Studio</h2>
                <div className="flex gap-2">
                    <Button variant="secondary" icon="CloudArrowUpIcon">Upload Asset</Button>
                    <Button variant="primary" icon="PlusIcon">New Design</Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
                {/* Templates Sidebar */}
                <Card className="md:col-span-1 p-4 flex flex-col">
                    <h3 className="font-bold text-sm text-gray-500 uppercase mb-4">Templates</h3>
                    <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {['Social Post', 'Story', 'Ad Banner', 'Email Header', 'Blog Cover', 'Presentation'].map((cat, i) => (
                            <div key={i} className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm font-medium flex justify-between group">
                                {cat}
                                <Icon name="ChevronRightIcon" className="w-4 h-4 text-gray-400 hidden group-hover:block" />
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Main Gallery Area */}
                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
                    {/* Create New Tile */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all cursor-pointer bg-gray-50 dark:bg-gray-800/20 group h-64">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Icon name="PlusIcon" className="w-8 h-8" />
                        </div>
                        <span className="font-bold">Start from scratch</span>
                    </div>

                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-200 dark:bg-gray-800">
                            {/* Mock Asset Preview */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-2xl opacity-50">
                                Design {i}
                            </div>

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <Button variant="primary" size="sm">Edit</Button>
                                <Button variant="secondary" size="sm">Download</Button>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-sm font-bold truncate">Summer Campaign Post {i}</div>
                                <div className="text-xs text-gray-300">Edited 2h ago</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
