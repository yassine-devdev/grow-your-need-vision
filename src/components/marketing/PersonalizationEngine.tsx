import React from 'react';
import { Card, Button, Icon, Badge } from '../shared/ui/CommonUI';

export const PersonalizationEngine: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personalization Engine</h2>
                <Button variant="primary" icon="PlusIcon">Create Rule</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6">
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                                <Icon name="UserCircleIcon" className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Homepage Hero Banner</h3>
                                    <Badge variant="success">Active</Badge>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Dynamically changes hero text based on industry.</p>

                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="neutral">IF</Badge>
                                        <span className="text-sm font-medium">Industry == "Finance"</span>
                                        <Icon name="ArrowRightIcon" className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-purple-600 font-bold">Show: "Secure Banking Solutions"</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="neutral">IF</Badge>
                                        <span className="text-sm font-medium">Industry == "Retail"</span>
                                        <Icon name="ArrowRightIcon" className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-purple-600 font-bold">Show: "Boost Your Sales Today"</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="neutral">ELSE</Badge>
                                        <span className="text-sm text-gray-500 font-bold">Show: Default Banner</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                                <Icon name="EnvelopeIcon" className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Welcome Email Block</h3>
                                    <Badge variant="success">Active</Badge>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Injects product recommendations based on browsing history.</p>

                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="neutral">Context</Badge>
                                        <span className="text-sm font-medium">Viewed Category: "Sneakers"</span>
                                        <Icon name="ArrowRightIcon" className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-blue-600 font-bold">Block: Trending Sneakers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">Performance Uplift</h3>
                        <div className="text-center py-6">
                            <div className="text-4xl font-black text-green-500">+18.5%</div>
                            <div className="text-sm text-gray-500 mt-1">Conversion Rate vs Control</div>
                        </div>
                        <div className="text-center py-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-4xl font-black text-blue-500">+12%</div>
                            <div className="text-sm text-gray-500 mt-1">Average Order Value</div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-gyn-blue-dark to-purple-900 text-white">
                        <h3 className="font-bold mb-2">AI Optimization</h3>
                        <p className="text-sm text-blue-100 mb-4">Enable "Auto-Optimize" to let AI automatically adjust rules for maximum conversion.</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">Auto-Optimize</span>
                            <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
