import React, { useState } from 'react';
import { useDataQuery } from '../../../hooks/useDataQuery';
import { DataTable } from '../../../components/shared/DataTable';
import { DataToolbar } from '../../../components/shared/DataToolbar';
import { Badge } from '../../../components/shared/ui/Badge';
import { Button } from '../../../components/shared/ui/Button';
import { Modal } from '../../../components/shared/ui/CommonUI';
import { IDCardGenerator } from './IDCardGenerator';
import { BulkImport } from './BulkImport';
import pb from '../../../lib/pocketbase';
import { User } from '../../../context/AuthContext';

export const TeacherDirectory: React.FC = () => {
    const query = useDataQuery<User>('users', {
        filter: 'role = "Teacher"',
        sort: '-created'
    });

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isIDModalOpen, setIsIDModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
    const [assignData, setAssignData] = useState({ subject: '', classId: '' });
    const [classes, setClasses] = useState<any[]>([]);

    const openOnboardModal = async (user: User) => {
        setSelectedUser(user);
        try {
            const res = await pb.collection('school_classes').getFullList();
            setClasses(res);
            setIsOnboardModalOpen(true);
        } catch (e) {
            console.error("Failed to fetch classes", e);
        }
    };

    const handleAssign = async () => {
        if (!selectedUser || !assignData.classId) return;
        try {
            // Assuming a 'teacher_assignments' collection or updating class record
            // Let's update the class record to set the teacher
            await pb.collection('school_classes').update(assignData.classId, {
                teacher: selectedUser.id
            });
            setIsOnboardModalOpen(false);
            alert(`Successfully assigned ${selectedUser.name} to class`);
        } catch (e) {
            console.error(e);
            alert('Assignment failed');
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
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedUser(user); setIsIDModalOpen(true); }}>ID Card</Button>
                    <Button size="sm" variant="primary" onClick={() => openOnboardModal(user)}>Assign Class</Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Teacher Directory</h2>
                <Button variant="primary" onClick={() => setIsImportModalOpen(true)}>Bulk Import</Button>
            </div>

            <DataToolbar 
                collectionName="teachers_view"
                onSearch={(term) => query.setFilter(`role = "Teacher" && (name ~ "${term}" || email ~ "${term}")`)}
                onExport={() => query.exportData('teachers.csv')}
                onRefresh={query.refresh}
                loading={query.loading}
            />

            <DataTable 
                query={query} 
                columns={columns}
                onRowClick={(user) => console.log("View profile", user)}
            />

            <IDCardGenerator 
                user={selectedUser} 
                isOpen={isIDModalOpen} 
                onClose={() => setIsIDModalOpen(false)} 
            />

            <BulkImport 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
                onSuccess={() => { setIsImportModalOpen(false); query.refresh(); }}
                role="Teacher"
            />

            <Modal isOpen={isOnboardModalOpen} onClose={() => setIsOnboardModalOpen(false)} title={`Assign Class to ${selectedUser?.name}`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Class</label>
                        <select 
                            className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                            value={assignData.classId}
                            onChange={e => setAssignData({ ...assignData, classId: e.target.value })}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsOnboardModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAssign}>Confirm Assignment</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
