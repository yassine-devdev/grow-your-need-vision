import React, { useState } from 'react';
import { useDataQuery } from '../../../hooks/useDataQuery';
import { DataTable } from '../../../components/shared/DataTable';
import { DataToolbar } from '../../../components/shared/DataToolbar';
import { Badge } from '../../../components/shared/ui/Badge';
import { Button } from '../../../components/shared/ui/Button';
import { Modal } from '../../../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../../../components/shared/modals/AIContentGeneratorModal';
import { IDCardGenerator } from './IDCardGenerator';
import { BulkImport } from './BulkImport';
import pb from '../../../lib/pocketbase';
import { User } from '../../../context/AuthContext';

export const StudentDirectory: React.FC = () => {
    const query = useDataQuery<User>('users', {
        filter: 'role = "Student"',
        sort: '-created'
    });

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isIDModalOpen, setIsIDModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [enrollData, setEnrollData] = useState({ classId: '' });
    const [classes, setClasses] = useState<any[]>([]);

    // Fetch classes when opening enroll modal
    const openEnrollModal = async (user: User) => {
        setSelectedUser(user);
        try {
            const res = await pb.collection('school_classes').getFullList();
            setClasses(res);
            setIsEnrollModalOpen(true);
        } catch (e) {
            console.error("Failed to fetch classes", e);
        }
    };

    const handleEnroll = async () => {
        if (!selectedUser || !enrollData.classId) return;
        try {
            await pb.collection('enrollments').create({
                student: selectedUser.id,
                class: enrollData.classId,
                enrolled_at: new Date().toISOString()
            });
            setIsEnrollModalOpen(false);
            alert(`Successfully enrolled ${selectedUser.name}`);
        } catch (e) {
            console.error(e);
            alert('Enrollment failed');
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        { 
            header: 'Status', 
            accessor: (user: User) => (
                <Badge variant={user.verified ? 'success' : 'warning'}>
                    {user.verified ? 'Verified' : 'Pending'}
                </Badge>
            ) 
        },
        {
            header: 'Last Active',
            accessor: (user: User) => user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'
        },
        {
            header: 'Actions',
            accessor: (user: User) => (
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedUser(user); setIsIDModalOpen(true); }}>ID Card</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedUser(user); setIsAIModalOpen(true); }}>Report</Button>
                    <Button size="sm" variant="primary" onClick={() => openEnrollModal(user)}>Enroll</Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Student Directory</h2>
                <Button variant="primary" onClick={() => setIsImportModalOpen(true)}>Bulk Import</Button>
            </div>

            <DataToolbar 
                collectionName="students_view"
                onSearch={(term) => query.setFilter(`role = "Student" && (name ~ "${term}" || email ~ "${term}")`)}
                onExport={() => query.exportData('students.csv')}
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
                role="Student"
            />

            <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title={`Enroll ${selectedUser?.name}`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Class</label>
                        <select 
                            className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                            value={enrollData.classId}
                            onChange={e => setEnrollData({ classId: e.target.value })}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsEnrollModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleEnroll}>Confirm Enrollment</Button>
                    </div>
                </div>
            </Modal>

            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={() => setIsAIModalOpen(false)}
                title={`Generate Report Card for ${selectedUser?.name}`}
                promptTemplate={`Generate a formal student report card for ${selectedUser?.name}.
                
                Include sections for:
                1. Academic Performance Summary (Simulated based on typical performance)
                2. Behavioral Assessment
                3. Attendance Record
                4. Teacher Comments
                
                Tone: Professional and Encouraging.`}
                contextData={{ student: selectedUser }}
            />
        </div>
    );
};
