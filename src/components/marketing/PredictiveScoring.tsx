import React from 'react';
import { Card, Button, Icon, Badge } from '../shared/ui/CommonUI';

export const PredictiveScoring: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <Icon name="CalculatorIcon" className="w-8 h-8 text-yellow-400" />
                        Predictive Lead Scoring
                    </h2>
                    <p className="text-gray-300 max-w-xl">
                        Our AI analyzes thousands of data points to assign conversion probabilities to every contact in real-time.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black text-yellow-400">92%</div>
                    <div className="text-sm text-gray-400 uppercase font-bold">Prediction Accuracy</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Config */}
                <Card className="lg:col-span-2 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">Scoring Models</h3>
                        <Button variant="secondary" size="sm">Retrain Models</Button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-gray-800 dark:text-white text-lg">B2B Enterprise Purchase</div>
                                    <p className="text-sm text-gray-500">Predicts likelihood of closing deals &gt; $100k</p>
                                </div>
                                <Badge variant="success">Active</Badge>
                            </div>
                            <div className="mt-4 flex gap-4 text-xs font-bold text-gray-500">
                                <span>Features: 42</span>
                                <span>AUC: 0.89</span>
                                <span>Updated: Today</span>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-gray-800 dark:text-white text-lg">SaaS Upsell (Pro Plan)</div>
                                    <p className="text-sm text-gray-500">Targeting existing free users</p>
                                </div>
                                <Badge variant="success">Active</Badge>
                            </div>
                            <div className="mt-4 flex gap-4 text-xs font-bold text-gray-500">
                                <span>Features: 28</span>
                                <span>AUC: 0.91</span>
                                <span>Updated: Yesterday</span>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl relative overflow-hidden group opacity-60">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-400"></div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-gray-800 dark:text-white text-lg">Churn Prediction V2</div>
                                    <p className="text-sm text-gray-500">Experimental model</p>
                                </div>
                                <Badge variant="neutral">Training</Badge>
                            </div>
                            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Top Signals */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-6">Top Predictive Signals</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Pricing Page Visits', impact: '+45 pts', color: 'text-green-600' },
                            { name: 'Email Open Rate > 50%', impact: '+25 pts', color: 'text-green-600' },
                            { name: 'Job Title: "VP" or "Director"', impact: '+30 pts', color: 'text-green-600' },
                            { name: 'Support Tickets > 3', impact: '-20 pts', color: 'text-red-500' },
                            { name: 'Inactive > 30 Days', impact: '-50 pts', color: 'text-red-500' },
                        ].map((signal, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{signal.name}</span>
                                <span className={`text-sm font-bold ${signal.color}`}>{signal.impact}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
