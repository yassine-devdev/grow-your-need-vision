import React, { useState } from 'react';
import { Card, Icon, Button, Badge } from '../../components/shared/ui/CommonUI';
import {
    useAssignedDeals,
    useDealTeam,
    useAssignDeal,
    useReassignDeal,
    useRemoveAssignment
} from '../../hooks/useCRMAssignments';
import { useDeals } from '../../hooks/useCRMDeals';
import { useCRMContacts } from '../../hooks/useCRMContacts'; // Assuming we have user/contact management or can mock users for now

// Mock users for assignment demonstration since we don't have a full User Management API exposed here yet
// In a real app, this would come from a useUsers() hook
const MOCK_USERS = [
    { id: 'user1', name: 'Alice Sales', role: 'Sales Rep' },
    { id: 'user2', name: 'Bob Manager', role: 'Sales Manager' },
    { id: 'user3', name: 'Charlie SDR', role: 'SDR' },
];

const DealAssignment: React.FC = () => {
    const { data: deals } = useDeals();
    const [selectedDeal, setSelectedDeal] = useState<string>('');

    const { data: team } = useDealTeam(selectedDeal);
    const assignDeal = useAssignDeal();
    const removeAssignment = useRemoveAssignment();

    // Assignment Form State
    const [assignUser, setAssignUser] = useState('');
    const [assignRole, setAssignRole] = useState<'owner' | 'collaborator' | 'viewer'>('collaborator');

    const handleAssign = async () => {
        if (!selectedDeal || !assignUser) return;

        await assignDeal.mutateAsync({
            dealId: selectedDeal,
            userId: assignUser,
            role: assignRole,
            assignedBy: 'current_user_id', // Mock ID
            notes: 'Assigned via Dashboard'
        });

        setAssignUser('');
    };

    const getDealTitle = (id: string) => deals?.find(d => d.id === id)?.title || 'Unknown Deal';
    const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || id;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Deal Selector */}
            <div className="space-y-6">
                <Card className="p-4">
                    <h3 className="font-bold mb-4">Select Deal</h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {deals?.map(deal => (
                            <div
                                key={deal.id}
                                onClick={() => setSelectedDeal(deal.id)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedDeal === deal.id
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <p className="font-medium">{deal.title}</p>
                                <p className="text-xs text-gray-500 mt-1">Stage: {deal.stage}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Right: Team Management */}
            <div className="col-span-2 space-y-6">
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold">Deal Team</h3>
                            <p className="text-sm text-gray-500">
                                {selectedDeal ? `Managing team for: ${getDealTitle(selectedDeal)}` : 'Select a deal to manage its team'}
                            </p>
                        </div>
                    </div>

                    {selectedDeal ? (
                        <>
                            {/* Assignment Input */}
                            <div className="flex gap-3 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <select
                                    className="flex-1 p-2 rounded border dark:bg-gray-900"
                                    value={assignUser}
                                    onChange={(e) => setAssignUser(e.target.value)}
                                >
                                    <option value="">Select Team Member...</option>
                                    {MOCK_USERS.map(user => (
                                        <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                                    ))}
                                </select>
                                <select
                                    className="w-40 p-2 rounded border dark:bg-gray-900"
                                    value={assignRole}
                                    onChange={(e) => setAssignRole(e.target.value as any)}
                                >
                                    <option value="owner">Owner</option>
                                    <option value="collaborator">Collaborator</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                                <Button
                                    onClick={handleAssign}
                                    disabled={!assignUser || assignDeal.isPending}
                                >
                                    <Icon name="PlusIcon" className="w-4 h-4 mr-2" />
                                    Assign
                                </Button>
                            </div>

                            {/* Team List */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm uppercase text-gray-500 mb-2">Current Members</h4>
                                {team?.map((assignment) => (
                                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                {getUserName(assignment.assigned_to).charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold">{getUserName(assignment.assigned_to)}</p>
                                                <p className="text-xs text-gray-500">Assigned {new Date(assignment.assigned_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={assignment.role === 'owner' ? 'success' : 'info'}>
                                                {assignment.role}
                                            </Badge>
                                            <button
                                                onClick={() => removeAssignment.mutate(assignment.id)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                                title="Remove"
                                            >
                                                <Icon name="TrashIcon" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {team?.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Icon name="UsersIcon" className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                        <p>No team members assigned yet.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Icon name="ArrowLeftIcon" className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">Select a deal from the list to manage assignments</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DealAssignment;
