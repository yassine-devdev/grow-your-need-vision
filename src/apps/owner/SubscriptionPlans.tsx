import React, { useEffect, useState } from 'react';
import { ownerService, SubscriptionPlan } from '../../services/ownerService';
import { Button, Card, Icon } from '../../components/shared/ui/CommonUI';
import { LoadingScreen } from '../../components/shared/LoadingScreen';

export const SubscriptionPlans: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await ownerService.getSubscriptionPlans();
            setPlans(data);
        } catch (error) {
            console.error("Failed to load plans", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Subscription Plans</h2>
                <Button variant="primary" leftIcon={<Icon name="Plus" className="w-4 h-4" />} className="bg-[#002366] hover:bg-[#001a4d] text-white border-none shadow-md">
                    Create Plan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card key={plan.id} className="p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gyn-blue-dark dark:text-white">{plan.name}</h3>
                                <div className="flex items-baseline mt-2">
                                    <span className="text-3xl font-black text-gray-900 dark:text-white">${plan.price_monthly}</span>
                                    <span className="text-gray-500 text-sm ml-1">/mo</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">${plan.price_yearly}/yr (Save 20%)</div>
                            </div>
                            {plan.is_active ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Active</span>
                            ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">Draft</span>
                            )}
                        </div>

                        <div className="space-y-3 mb-6">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                    <Icon name="Check" className="w-4 h-4 text-green-500 mr-2" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                            <Button variant="outline" size="sm" className="w-full">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
