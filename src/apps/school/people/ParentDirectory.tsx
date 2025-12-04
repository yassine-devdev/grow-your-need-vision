import React, { useState } from 'react';
import { useDataQuery } from '../../../hooks/useDataQuery';
import { DataTable } from '../../../components/shared/DataTable';
import { DataToolbar } from '../../../components/shared/DataToolbar';
import { Badge } from '../../../components/shared/ui/Badge';
import { Button } from '../../../components/shared/ui/Button';
import { Modal } from '../../../components/shared/ui/CommonUI';
import { BulkImport } from './BulkImport';
import pb from '../../../lib/pocketbase';
import { User } from '../../../context/AuthContext';

export const ParentDirectory: React.FC = () => {
    const query = useDataQuery<User>('users', {
        filter: 'role = "Parent"',
        sort: '-created'
    });

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState({ studentId: '', relationship: 'Parent' });
    const [students, setStudents] = useState<User[]>([]);

    const openLinkModal = async (user: User) => {
        setSelectedUser(user);
        try {
            const res = await pb.collection('users').getList(1, 50, { filter: 'role = "Student"' });
            setStudents(res.items as unknown as User[]);
            setIsLinkModalOpen(true);
        } catch (e) {
            console.error("Failed to fetch students", e);
        }
    };

    const handleLink = async () => {
        if (!selectedUser || !linkData.studentId) return;
        try {
            await pb.collection('parent_student_links').create({
                parent: selectedUser.id,
                student: linkData.studentId,
                relationship: linkData.relationship
            });
            setIsLinkModalOpen(false);
            alert(`Successfully linked to student`);
        } catch (e) {
            console.error(e);
            alert('Linking failed');
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        { 
            header: 'Status', 
            accessor: (user: User) => (
                <Badge variant={user.verified ? 'success' : 'warning'}>
                    {user.verified ? 'Active' : 'Pending'}
                </Badge>
            ) 
        },
        {
            header: 'Actions',
            accessor: (user: User) => (
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="primary" onClick={() => openLinkModal(user)}>Link Student</Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Parent Directory</h2>
                <Button variant="primary" onClick={() => setIsImportModalOpen(true)}>Bulk Import</Button>
            </div>

            <DataToolbar 
                collectionName="parents_view"
                onSearch={(term) => query.setFilter(`role = "Parent" && (name ~ "${term}" || email ~ "${term}")`)}
                onExport={() => query.exportData('parents.csv')}
                onRefresh={query.refresh}
                loading={query.loading}
            />

            <DataTable 
                query={query} 
                columns={columns}
                onRowClick={(user) => console.log("View profile", user)}
            />

            <BulkImport 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
                onSuccess={() => { setIsImportModalOpen(false); query.refresh(); }}
                role="Parent"
            />

            <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title={`Link Student to ${selectedUser?.name}`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Student</label>
                        <select 
                            className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                            value={linkData.studentId}
                            onChange={e => setLinkData({ ...linkData, studentId: e.target.value })}
                        >
                            <option value="">-- Select Student --</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Relationship</label>
                        <select 
                            className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                            value={linkData.relationship}
                            onChange={e => setLinkData({ ...linkData, relationship: e.target.value })}
                        >
                            <option value="Parent">Parent</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Guardian">Guardian</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsLinkModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleLink}>Confirm Link</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
