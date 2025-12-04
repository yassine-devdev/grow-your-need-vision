import React, { useState, useEffect } from 'react';
import { Heading1, Text } from '../../components/shared/ui/Typography';
import { Card } from '../../components/shared/ui/Card';
import { Tabs } from '../../components/shared/ui/Tabs';
import { Button } from '../../components/shared/ui/Button';
import { Icon } from '../../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../../components/shared/modals/AIContentGeneratorModal';
import { FinancialReports } from './finance/FinancialReports';
import { FeeStructure } from './finance/FeeStructure';
import { InvoiceList } from '@/apps/school/finance/InvoiceList';
import { ExpenseManager } from './finance/ExpenseManager';
import { Payroll } from './finance/Payroll';
import pb from '../../lib/pocketbase';

interface FinanceProps {
    activeTab?: string;
    activeSubNav?: string;
}

const Finance: React.FC<FinanceProps> = ({ activeTab: initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'Overview');
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        outstanding: 0,
        totalExpenses: 0,
        netIncome: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Revenue (Paid Invoices)
                const paidInvoices = await pb.collection('school_invoices').getFullList({
                    filter: 'status = "Paid"'
                });
                const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

                // 2. Outstanding
                const pendingInvoices = await pb.collection('school_invoices').getFullList({
                    filter: 'status = "Pending" || status = "Overdue"'
                });
                const outstanding = pendingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

                // 3. Expenses
                const expenses = await pb.collection('expenses').getFullList({
                    filter: 'status = "Approved"'
                });
                const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

                // 4. Payroll (Paid)
                const payroll = await pb.collection('payroll').getFullList({
                    filter: 'status = "Paid"'
                });
                const totalPayroll = payroll.reduce((sum, p) => sum + (p.amount || 0), 0);

                const totalOutflow = totalExpenses + totalPayroll;

                setStats({
                    totalRevenue,
                    outstanding,
                    totalExpenses: totalOutflow,
                    netIncome: totalRevenue - totalOutflow
                });
            } catch (e) {
                console.error("Failed to load stats", e);
            }
        };

        fetchStats();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return <FinancialReports stats={stats} />;
            case 'Fees':
                return <FeeStructure />;
            case 'Invoices':
                return <InvoiceList />;
            case 'Expenses':
                return <ExpenseManager />;
            case 'Payroll':
                return <Payroll />;
            default:
                return <FinancialReports stats={stats} />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end">
                <div>
                    <Heading1>Financial Management</Heading1>
                    <Text variant="muted">Track fees, payments, expenses, and payroll.</Text>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => setIsAIModalOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Icon name="Sparkles" className="w-4 h-4 text-purple-500" />
                    AI Financial Audit
                </Button>
            </div>

            <Card className="min-h-[600px]" padding="none">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <Tabs 
                        tabs={['Overview', 'Fees', 'Invoices', 'Expenses', 'Payroll']} 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab} 
                    />
                </div>

                <div className="p-6">
                    {renderContent()}
                </div>
            </Card>

            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={() => setIsAIModalOpen(false)}
                title="AI Financial Audit"
                promptTemplate={`Analyze the school's financial health based on the following real-time data:
                
                - Total Revenue: $${stats.totalRevenue.toLocaleString()}
                - Total Expenses & Payroll: $${stats.totalExpenses.toLocaleString()}
                - Outstanding Fees: $${stats.outstanding.toLocaleString()}
                - Net Income: $${stats.netIncome.toLocaleString()}
                
                Please provide:
                1. Cash Flow Analysis
                2. Cost Reduction Opportunities
                3. Revenue Growth Strategies
                4. Risk Assessment`}
                contextData={{ activeTab, stats }}
            />
        </div>
    );
};

export default Finance;
