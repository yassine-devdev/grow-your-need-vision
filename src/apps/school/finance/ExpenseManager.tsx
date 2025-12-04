import React, { useState } from 'react';
import { useDataQuery } from '../../../hooks/useDataQuery';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { DataToolbar } from '../../../components/shared/DataToolbar';
import { Badge } from '../../../components/shared/ui/Badge';
import { Button } from '../../../components/shared/ui/Button';
import { Modal } from '../../../components/shared/ui/CommonUI';
import { Input } from '../../../components/shared/ui/Input';
import { Select } from '../../../components/shared/ui/Select';
import pb from '../../../lib/pocketbase';

interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approved_by?: string;
}

export const ExpenseManager: React.FC = () => {
    const query = useDataQuery<Expense>('expenses', {
        sort: '-date'
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState<Partial<Expense>>({
        title: '',
        amount: 0,
        category: 'Supplies',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    });

    const handleCreate = async () => {
        try {
            await pb.collection('expenses').create(newExpense);
            setIsModalOpen(false);
            query.refresh();
            setNewExpense({ title: '', amount: 0, category: 'Supplies', date: new Date().toISOString().split('T')[0], status: 'Pending' });
        } catch (e) {
            alert('Failed to record expense');
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await pb.collection('expenses').update(id, { status });
            query.refresh();
        } catch (e) {
            console.error(e);
        }
    };

    const columns: Column<Expense>[] = [
        { header: 'Title', accessor: 'title', sortable: true },
        { header: 'Category', accessor: 'category', sortable: true },
        { header: 'Date', accessor: (e: Expense) => new Date(e.date).toLocaleDateString(), sortable: true },
        { header: 'Amount', accessor: (e: Expense) => `$${e.amount.toFixed(2)}`, sortable: true },
        { 
            header: 'Status', 
            accessor: (e: Expense) => (
                <Badge variant={e.status === 'Approved' ? 'success' : e.status === 'Rejected' ? 'danger' : 'warning'}>
                    {e.status}
                </Badge>
            ) 
        },
        {
            header: 'Actions',
            accessor: (e: Expense) => (
                <div className="flex gap-2">
                    {e.status === 'Pending' && (
                        <>
                            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleStatusChange(e.id, 'Approved')}>Approve</Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleStatusChange(e.id, 'Rejected')}>Reject</Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Expense Management</h2>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>Record Expense</Button>
            </div>

            <DataToolbar 
                collectionName="expenses_view"
                onSearch={(term) => query.setFilter(`title ~ "${term}" || category ~ "${term}"`)}
                onExport={() => query.exportData('expenses.csv')}
                onRefresh={query.refresh}
                loading={query.loading}
            />

            <DataTable query={query} columns={columns} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Expense">
                <div className="space-y-4">
                    <Input label="Title" value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} />
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input label="Amount" type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} />
                        </div>
                        <div className="flex-1">
                            <Input label="Date" type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <Select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                            <option value="Supplies">Supplies</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Events">Events</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreate}>Save Expense</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
