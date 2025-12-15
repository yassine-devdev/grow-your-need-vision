import React from 'react';
import { Card, Button, Icon, Badge, Avatar } from '../shared/ui/CommonUI';

export const SocialScheduler: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Social Scheduler</h2>
                <div className="flex gap-2">
                    <Button variant="secondary" icon="Cog6ToothIcon">Connect Accounts</Button>
                    <Button variant="primary" icon="PlusIcon">Create Post</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar / Queue */}
                <Card className="lg:col-span-2 p-6">
                    <h3 className="font-bold text-lg mb-4">Upcoming Queue</h3>
                    <div className="space-y-4">
                        {[
                            { date: 'Today, 2:00 PM', platform: 'LinkedIn', content: 'Excited to announce our new feature launch! 🚀 #SaaS #Growth', status: 'Scheduled', image: true },
                            { date: 'Tomorrow, 9:00 AM', platform: 'Twitter', content: 'What is the biggest challenge in marketing today? 👇', status: 'Scheduled', image: false },
                            { date: 'Wed, 12:30 PM', platform: 'Instagram', content: 'Behind the scenes at our team retreat. 🌿', status: 'Draft', image: true },
                        ].map((post, i) => (
                            <div key={i} className="flex gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
                                    {post.image ? <Icon name="PhotoIcon" className="w-6 h-6" /> : <Icon name="ChatBubbleBottomCenterTextIcon" className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="neutral" size="sm" className="bg-white border-gray-200">{post.platform}</Badge>
                                            <span className="text-sm font-bold text-gray-500">{post.date}</span>
                                        </div>
                                        <Badge variant={post.status === 'Scheduled' ? 'success' : 'default'}>{post.status}</Badge>
                                    </div>
                                    <p className="text-gray-800 dark:text-white text-sm line-clamp-2 font-medium">{post.content}</p>
                                    <div className="mt-2 text-xs text-gray-400 hidden group-hover:block transition-all">
                                        Click to edit
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Account Status */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Connected Accounts</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"><span className="font-bold text-xs">in</span></div>
                                    <span className="text-sm font-bold">LinkedIn</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white"><span className="font-bold text-xs">X</span></div>
                                    <span className="text-sm font-bold">Twitter / X</span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                            <div className="flex items-center justify-between opacity-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white"><span className="font-bold text-xs">IG</span></div>
                                    <span className="text-sm font-bold">Instagram</span>
                                </div>
                                <Badge variant="neutral" size="sm">Connect</Badge>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-lg mb-2 text-blue-900 dark:text-blue-100">AI Assistant</h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">Need inspiration? Use AI to generate 5 post ideas for this week.</p>
                        <Button variant="primary" size="sm" className="w-full">Generate Ideas</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};
