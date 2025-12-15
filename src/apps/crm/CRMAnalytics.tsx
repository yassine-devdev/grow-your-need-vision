import React from 'react';
import { Card, Icon } from '../../components/shared/ui/CommonUI';
import {
    useConversionRates,
    usePipelineHealth,
    useWinLossAnalysis,
    useRevenueByPeriod
} from '../../hooks/useCRMAnalytics';

const CRMAnalytics: React.FC = () => {
    const { data: conversion } = useConversionRates();
    const { data: pipeline } = usePipelineHealth();
    const { data: winLoss } = useWinLossAnalysis();
    const { data: revenue } = useRevenueByPeriod('year');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Analytics</h2>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Total Pipeline Value</p>
                    <p className="text-2xl font-bold mt-1 text-blue-600">
                        {formatCurrency(pipeline?.total_value || 0)}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Weighted Value</p>
                    <p className="text-2xl font-bold mt-1 text-purple-600">
                        {formatCurrency(pipeline?.weighted_value || 0)}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Win Rate</p>
                    <p className="text-2xl font-bold mt-1 text-green-600">
                        {winLoss?.win_rate.toFixed(1)}%
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Avg Cycle Time</p>
                    <p className="text-2xl font-bold mt-1 text-orange-600">
                        {winLoss?.avg_cycle_time.toFixed(1)} days
                    </p>
                </Card>
            </div>

            {/* Conversion Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6">Conversion Funnel</h3>
                    <div className="space-y-4">
                        {/* Lead to Prospect */}
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                        Lead to Prospect
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-blue-600">
                                        {conversion?.lead_to_prospect.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                                <div style={{ width: `${conversion?.lead_to_prospect}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                            </div>
                        </div>

                        {/* Prospect to Customer */}
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                                        Prospect to Customer
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-green-600">
                                        {conversion?.prospect_to_customer.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100">
                                <div style={{ width: `${conversion?.prospect_to_customer}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                            </div>
                        </div>

                        {/* Overall */}
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Overall Conversion (Lead to Customer)</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {conversion?.overall.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Pipeline by Stage</h3>
                    <div className="space-y-4">
                        {pipeline?.by_stage && Object.entries(pipeline.by_stage).map(([stage, count]) => (
                            <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
                                <span className="capitalize font-medium">{stage}</span>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${(count / (winLoss?.total_deals || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-bold">{count}</span>
                                </div>
                            </div>
                        ))}
                        {!pipeline?.by_stage && <p className="text-gray-500">No active deals</p>}
                    </div>
                </Card>
            </div>

            {/* Revenue Trend - Simple visualization */}
            <Card className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Revenue Trend (Last 12 Months)</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                    {revenue?.map((value, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                            <div
                                className="w-full bg-blue-500 opacity-60 group-hover:opacity-100 transition-opacity rounded-t"
                                style={{ height: `${(value / (Math.max(...(revenue || [1])))) * 100}%` }}
                            ></div>
                            <span className="text-xs text-gray-500">M{idx + 1}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default CRMAnalytics;
