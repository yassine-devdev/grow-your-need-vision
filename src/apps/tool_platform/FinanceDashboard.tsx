import React from 'react';
import { Card, Button, Icon, Badge } from '../../components/shared/ui/CommonUI';

export const FinanceDashboard: React.FC = () => {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Finance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-emerald-100 font-medium text-sm">Total Revenue</p>
                            <h2 className="text-3xl font-black mt-1">$124,500.00</h2>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Icon name="CurrencyDollarIcon" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-100">
                        <Icon name="ArrowTrendingUpIcon" className="w-4 h-4" />
                        <span>+12.5% vs last month</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Pending Invoices</p>
                            <h2 className="text-3xl font-black text-gray-800 dark:text-white mt-1">$12,450</h2>
                        </div>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                            <Icon name="ClockIcon" className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-orange-500">
                        <span>5 invoices overdue</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Expenses (MTD)</p>
                            <h2 className="text-3xl font-black text-gray-800 dark:text-white mt-1">$8,320</h2>
                        </div>
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                            <Icon name="CreditCardIcon" className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Server costs, API usage</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-800 dark:text-white">Recent Transactions</h3>
                        <Button size="sm" variant="outline" icon="ArrowDownTrayIcon">Export CSV</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {[
                                    { date: 'Dec 01, 2025', desc: 'Stripe Payout', amount: 4500.00, status: 'Completed', type: 'income' },
                                    { date: 'Nov 30, 2025', desc: 'AWS Infrastructure', amount: -320.50, status: 'Completed', type: 'expense' },
                                    { date: 'Nov 29, 2025', desc: 'School Subscription #8821', amount: 299.00, status: 'Completed', type: 'income' },
                                    { date: 'Nov 28, 2025', desc: 'Marketing Ads', amount: -150.00, status: 'Pending', type: 'expense' },
                                    { date: 'Nov 28, 2025', desc: 'Consulting Fee', amount: 1200.00, status: 'Completed', type: 'income' },
                                ].map((t, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{t.date}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{t.desc}</td>
                                        <td className={`px-6 py-4 font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-800 dark:text-white'}`}>
                                            {t.type === 'income' ? '+' : ''}{t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={t.status === 'Completed' ? 'success' : 'warning'}>{t.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-blue-600"><Icon name="EllipsisHorizontalIcon" className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Quick Actions & Reports */}
                <div className="space-y-6">
                    <Card className="p-4">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">Financial Reports</h3>
                        <div className="space-y-2">
                            {['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'Tax Summary'].map((report) => (
                                <div key={report} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Icon name="DocumentTextIcon" className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{report}</span>
                                    </div>
                                    <Icon name="ArrowDownTrayIcon" className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Reconciliation Needed</h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">3 transactions from yesterday need categorization.</p>
                        <Button size="sm" variant="primary" className="w-full">Review Transactions</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};
