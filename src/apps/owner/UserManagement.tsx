import React, { useState, useEffect } from 'react';
import pb from '../../lib/pocketbase';
import { RecordModel } from 'pocketbase';
import { Card, Button, Input, Badge, Avatar, Icon, Modal, Select } from '../../components/shared/ui/CommonUI';
import { Table, Thead, Tr, Th, Td } from '../../components/shared/ui/Table';

interface User extends RecordModel {
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status?: 'active' | 'suspended';
    last_login?: string;
}

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState<{ role: string; status: string }>({ role: '', status: '' });
    
    // Invite Form State
    const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Student' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const filter = searchQuery
                ? `name ~ "${searchQuery}" || email ~ "${searchQuery}"`
                : '';

            const result = await pb.collection('users').getList<User>(1, 50, {
                filter,
                sort: '-created',
                requestKey: null
            });
            setUsers(result.items);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            role: user.role,
            status: user.status || 'active'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        try {
            await pb.collection('users').update(selectedUser.id, {
                role: editForm.role,
                status: editForm.status
            });
            setIsEditModalOpen(false);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Failed to update user", error);
            alert("Failed to update user. Please try again.");
        }
    };

    const handleInviteUser = async () => {
        if (!inviteForm.email || !inviteForm.name) return;
        try {
            const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
            await pb.collection('users').create({
                email: inviteForm.email,
                emailVisibility: true,
                password: tempPassword,
                passwordConfirm: tempPassword,
                name: inviteForm.name,
                role: inviteForm.role,
                status: 'active',
                verified: true // Auto-verify for now
            });
            
            // In a real app, we would trigger an email here via a backend hook or cloud function
            alert(`User created! Temporary password: ${tempPassword}`);
            
            setIsInviteModalOpen(false);
            setInviteForm({ name: '', email: '', role: 'Student' });
            fetchUsers();
        } catch (error) {
            console.error("Failed to invite user", error);
            alert("Failed to invite user. Email might already be in use.");
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await pb.collection('users').delete(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Failed to delete user.");
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">User Management</h2>
                    <p className="text-gray-500 dark:text-gray-400">Global administration of all platform users.</p>
                </div>
                <Button variant="primary" leftIcon={<Icon name="PlusCircleIcon" className="w-5 h-5" />} onClick={() => setIsInviteModalOpen(true)}>
                    Invite User
                </Button>
            </div>

            <Card className="p-4">
                <div className="mb-4">
                    <Input
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Icon name="MagnifyingGlassIcon" className="w-5 h-5 text-gray-400" />}
                    />
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>User</Th>
                                <Th>Role</Th>
                                <Th>Status</Th>
                                <Th>Last Login</Th>
                                <Th className="text-right">Actions</Th>
                            </Tr>
                        </Thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan={5} className="text-center py-8 text-gray-400">Loading users...</Td>
                                </Tr>
                            ) : users.length === 0 ? (
                                <Tr>
                                    <Td colSpan={5} className="text-center py-8 text-gray-400">No users found.</Td>
                                </Tr>
                            ) : (
                                users.map(user => (
                                    <Tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <Td>
                                            <div className="flex items-center gap-3">
                                                <Avatar src={user.avatar} name={user.name} size="sm" />
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-white">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>
                                            <Badge variant="neutral" className="uppercase text-[10px]">{user.role}</Badge>
                                        </Td>
                                        <Td>
                                            <Badge variant={user.status === 'suspended' ? 'danger' : 'success'}>
                                                {user.status || 'active'}
                                            </Badge>
                                        </Td>
                                        <Td className="text-gray-500 text-sm">
                                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                        </Td>
                                        <Td className="text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="ghost" onClick={() => handleEditClick(user)}>Edit</Button>
                                                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit User: ${selectedUser?.name}`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveUser}>Save Changes</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Select
                        label="Role"
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                        <option value="Owner">Owner</option>
                        <option value="Admin">Admin</option>
                        <option value="SchoolAdmin">School Admin</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Student">Student</option>
                        <option value="Parent">Parent</option>
                    </Select>

                    <Select
                        label="Status"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </Select>
                </div>
            </Modal>
            {/* Invite User Modal */}
            <Modal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                title="Invite New User"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <Input
                            value={inviteForm.name}
                            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <Input
                            type="email"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <Select
                            label="Role"
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                        >
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Parent">Parent</option>
                            <option value="Staff">Staff</option>
                            <option value="Admin">Admin</option>
                            <option value="Owner">Owner</option>
                        </Select>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleInviteUser}>Send Invitation</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
