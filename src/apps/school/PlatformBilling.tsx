import React, { useState, useEffect } from 'react';
import { billingService, Invoice } from '../../services/billingService';
import { SubscriptionPlans } from '../owner/SubscriptionPlans';
import { OwnerIcon } from '../../components/shared/OwnerIcons';
import { GlassCard } from '../../components/shared/ui/GlassCard';
import { Table, Thead, Tr, Th, Td } from '../../components/shared/ui/Table';
import { Badge } from '../../components/shared/ui/Badge';
import { Button } from '../../components/shared/ui/Button';

interface PlatformBillingProps {
    activeSubNav: string;
}

export const PlatformBilling: React.FC<PlatformBillingProps> = ({ activeSubNav }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeSubNav === 'Invoices') {
                    const result = await billingService.getInvoices();
                    setInvoices(result);
                }
            } catch (error) {
                console.error("Failed to fetch billing data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeSubNav]);

    if (activeSubNav === 'Gateways') {
        return (
            <GlassCard className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <OwnerIcon name="CreditCard" className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Payment Gateways</h2>
                <p className="text-gray-500 mb-6">Configure Stripe, PayPal, and other payment providers.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-800">Stripe</div>
                                <div className="text-xs text-green-600 font-bold">Connected</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Configure</Button>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-white opacity-60">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-800">PayPal</div>
                                <div className="text-xs text-gray-400">Not Connected</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Connect</Button>
                    </div>
                </div>
            </GlassCard>
        );
    }

    if (activeSubNav === 'Plans') {
        return <SubscriptionPlans />;
    }

    // Default: Invoices
    return (
        <GlassCard>
            <div className="p-6 border-b border-white/50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">Platform Invoices</h3>
                <Button variant="ghost" size="sm">Export CSV</Button>
            </div>
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading invoices...</div>
                ) : invoices.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No invoices found.</div>
                ) : (
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Invoice ID</Th>
                                <Th>Tenant</Th>
                                <Th>Amount</Th>
                                <Th>Status</Th>
                                <Th>Date</Th>
                                <Th className="text-right">Actions</Th>
                            </Tr>
                        </Thead>
                        <tbody>
                            {invoices.map(inv => (
                                <Tr key={inv.id}>
                                    <Td><span className="font-mono text-xs text-gray-500">#{inv.id.substring(0,8)}</span></Td>
                                    <Td><span className="font-bold text-gray-700">Tenant {inv.tenantId.substring(0,5)}...</span></Td>
                                    <Td><span className="font-bold text-gray-800">${inv.amount.toFixed(2)}</span></Td>
                                    <Td>
                                        <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}>
                                            {inv.status}
                                        </Badge>
                                    </Td>
                                    <Td><span className="text-sm text-gray-500">{new Date(inv.created).toLocaleDateString()}</span></Td>
                                    <Td className="text-right">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </Td>
                                </Tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </GlassCard>
    );
};
