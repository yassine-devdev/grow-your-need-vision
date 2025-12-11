import React, { useState, useEffect } from 'react';
import { Card, Icon } from '../../components/shared/ui/CommonUI';
import { billingService, BillingStats } from '../../services/billingService';
import { SimpleLineChart } from '../dashboards/components/SimpleLineChart';

export const AnalyticsDashboard: React.FC = () => {
    const [stats, setStats] = useState<BillingStats | null>(null);
    const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [statsData, historyData] = await Promise.all([
                billingService.getBillingStats(),
                billingService.getRevenueHistory()
            ]);

            setStats(statsData);
            setRevenueHistory(historyData);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center h-96">
                <Icon name="ArrowPathIcon" className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Platform Analytics</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Revenue, growth, and engagement metrics</p>
            </div>

            {/* Revenue KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">MRR</p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                                ${stats.mrr.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                            <Icon name="CurrencyDollarIcon" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">ARR</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                                ${stats.arr.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Annual Recurring Revenue</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Icon name="BanknotesIcon" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">LTV</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                                ${Math.round(stats.ltv).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Lifetime Value</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <Icon name="TrendingUpIcon" className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                                {stats.churn_rate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Monthly Churn</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                            <Icon name="ArrowTrendingDownIcon" className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Subscription Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {stats.active_subscriptions}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Icon name="CheckCircleIcon" className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Trial Subscriptions</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {stats.trial_subscriptions}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Icon name="ClockIcon" className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Failed Payments</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                                {stats.failed_payments}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                            <Icon name="ExclamationTriangleIcon" className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Growth</h2>
                <div className="h-80">
                    <SimpleLineChart
                        data={revenueHistory.map(item => ({
                            name: item.month,
                            value: item.revenue
                        }))}
                        color="#7C3AED"
                        height="100%"
                    />
                </div>
            </Card>
        </div>
    );
};
