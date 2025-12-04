import React from 'react';
import { Card, Button, Badge, Icon } from '../../components/shared/ui/CommonUI';

export const AIStrategy: React.FC = () => {
    const objectives = [
        { title: 'Reduce Support Tickets', target: '30% reduction', progress: 65, status: 'On Track' },
        { title: 'Increase User Engagement', target: '5 mins/session', progress: 40, status: 'At Risk' },
        { title: 'Automate Content Moderation', target: '99% accuracy', progress: 88, status: 'On Track' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI Strategy & Objectives</h2>
                    <p className="text-gray-500">Define and track high-level goals for the AI assistant.</p>
                </div>
                <Button variant="primary" icon="PlusIcon">New Objective</Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {objectives.map((obj, idx) => (
                    <Card key={idx} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{obj.title}</h3>
                                <p className="text-sm text-gray-500">Target: {obj.target}</p>
                            </div>
                            <Badge variant={obj.status === 'On Track' ? 'success' : 'warning'}>{obj.status}</Badge>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 mb-1">
                            <div className="bg-gyn-blue-medium h-2.5 rounded-full" style={{ width: `${obj.progress}%` }}></div>
                        </div>
                        <div className="text-right text-xs text-gray-500">{obj.progress}% Complete</div>
                    </Card>
                ))}
            </div>

            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Icon name="LightBulbIcon" className="w-5 h-5" />
                    Strategic Insight
                </h3>
                <p className="text-blue-700 dark:text-blue-200 text-sm">
                    Based on current trends, focusing on "Personalized Recommendations" could yield a 15% increase in user retention. Consider adding this to your objectives for Q3.
                </p>
            </Card>
        </div>
    );
};
