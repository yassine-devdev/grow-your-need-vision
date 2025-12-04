import React, { useState, useEffect } from 'react';
import { useDataQuery } from '../../../hooks/useDataQuery';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { DataToolbar } from '../../../components/shared/DataToolbar';
import { Badge } from '../../../components/shared/ui/Badge';
import { Button } from '../../../components/shared/ui/Button';
import { Modal } from '../../../components/shared/ui/CommonUI';
import { Select } from '../../../components/shared/ui/Select';
import { Input } from '../../../components/shared/ui/Input';
import { Text } from '../../../components/shared/ui/Typography';
import pb from '../../../lib/pocketbase';
import { User } from '../../../context/AuthContext';

interface Invoice {
    id: string;
    student: string;
    expand?: { student?: User; fee?: any };
    fee: string;
    amount: number;
    status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
    due_date: string;
}

export const InvoiceList: React.FC = () => {
    const query = useDataQuery<Invoice>('school_invoices', {
        sort: '-created',
        expand: 'student,fee'
    });

    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentData, setPaymentData] = useState({ amount: 0, method: 'Cash', reference: '' });
    
    const [generateForm, setGenerateForm] = useState({ classId: '', feeId: '' });
    const [classes, setClasses] = useState<any[]>([]);
    const [fees, setFees] = useState<any[]>([]);

    useEffect(() => {
        if (isGenerateModalOpen) {
            pb.collection('school_classes').getFullList({ sort: 'name' }).then(setClasses);
            pb.collection('fees').getFullList({ sort: 'name' }).then(setFees);
        }
    }, [isGenerateModalOpen]);

    const handleGenerate = async () => {
        if (!generateForm.classId || !generateForm.feeId) return;
        try {
            const enrollments = await pb.collection('enrollments').getFullList({
                filter: `class = "${generateForm.classId}"`,
                expand: 'student'
            });

            const fee = fees.find(f => f.id === generateForm.feeId);
            if (!fee) return;

            let count = 0;
            for (const enr of enrollments) {
                await pb.collection('school_invoices').create({
                    student: enr.student,
                    fee: fee.id,
                    amount: fee.amount,
                    status: 'Pending',
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                });
                count++;
            }
            
            alert(`Generated ${count} invoices`);
            setIsGenerateModalOpen(false);
            query.refresh();
        } catch (e) {
            console.error(e);
            alert('Failed to generate invoices');
        }
    };

    const openPaymentModal = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setPaymentData({ amount: invoice.amount, method: 'Cash', reference: '' });
        setIsPaymentModalOpen(true);
    };

    const handleRecordPayment = async () => {
        if (!selectedInvoice) return;
        try {
            // 1. Create Payment Record
            await pb.collection('school_payments').create({
                invoice: selectedInvoice.id,
                student: selectedInvoice.student,
                amount: paymentData.amount,
                method: paymentData.method,
                reference: paymentData.reference,
                date: new Date().toISOString()
            });

            // 2. Update Invoice Status
            // In a real app, we'd check if partial payment or full. For now, assume full.
            await pb.collection('school_invoices').update(selectedInvoice.id, { status: 'Paid' });

            setIsPaymentModalOpen(false);
            query.refresh();
            alert('Payment recorded successfully');
        } catch (e) {
            console.error(e);
            alert('Failed to record payment');
        }
    };

    const columns: Column<Invoice>[] = [
        { header: 'Invoice ID', accessor: (i: Invoice) => `#${i.id.substring(0, 8)}`, sortable: true },
        { header: 'Student', accessor: (i: Invoice) => i.expand?.student?.name || 'Unknown', sortable: true },
        { header: 'Fee Type', accessor: (i: Invoice) => i.expand?.fee?.name || 'Custom', sortable: true },
        { header: 'Amount', accessor: (i: Invoice) => `$${i.amount}`, sortable: true },
        { header: 'Due Date', accessor: (i: Invoice) => new Date(i.due_date).toLocaleDateString(), sortable: true },
        { 
            header: 'Status', 
            accessor: (i: Invoice) => (
                <Badge variant={i.status === 'Paid' ? 'success' : i.status === 'Overdue' ? 'danger' : 'warning'}>
                    {i.status}
                </Badge>
            ) 
        },
        {
            header: 'Actions',
            accessor: (i: Invoice) => (
                <div className="flex gap-2">
                    {i.status !== 'Paid' && (
                        <Button size="sm" variant="primary" onClick={() => openPaymentModal(i)}>Record Payment</Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Invoices</h2>
                <Button variant="primary" onClick={() => setIsGenerateModalOpen(true)}>Generate Invoices</Button>
            </div>

            <DataToolbar 
                collectionName="school_invoices"
                onSearch={(term) => query.setFilter(`status ~ "${term}"`)}
                onExport={() => query.exportData('invoices.csv')}
                onRefresh={query.refresh}
                loading={query.loading}
            />

            <DataTable query={query} columns={columns} />

            {/* Generate Modal */}
            <Modal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} title="Generate Invoices">
                <div className="space-y-4">
                    <Text>Select a class and a fee type to generate invoices for all students in that class.</Text>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                        <Select value={generateForm.classId} onChange={e => setGenerateForm({ ...generateForm, classId: e.target.value })}>
                            <option value="">Select Class...</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Type</label>
                        <Select value={generateForm.feeId} onChange={e => setGenerateForm({ ...generateForm, feeId: e.target.value })}>
                            <option value="">Select Fee...</option>
                            {fees.map(f => <option key={f.id} value={f.id}>{f.name} (${f.amount})</option>)}
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsGenerateModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleGenerate}>Generate</Button>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal */}
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Record Payment for #${selectedInvoice?.id.substring(0, 8)}`}>
                <div className="space-y-4">
                    <Input label="Amount Received ($)" type="number" value={paymentData.amount} onChange={e => setPaymentData({ ...paymentData, amount: Number(e.target.value) })} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                        <Select value={paymentData.method} onChange={e => setPaymentData({ ...paymentData, method: e.target.value })}>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Check">Check</option>
                            <option value="Online">Online</option>
                        </Select>
                    </div>
                    <Input label="Reference / Transaction ID" placeholder="Optional" value={paymentData.reference} onChange={e => setPaymentData({ ...paymentData, reference: e.target.value })} />
                    
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleRecordPayment}>Confirm Payment</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
