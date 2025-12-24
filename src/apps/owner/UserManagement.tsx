import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, Badge, Input, Select } from '../../components/shared/ui/CommonUI';
import { WidgetErrorBoundary } from '../../components/shared/ui/WidgetErrorBoundary';
import { useApiError } from '../../hooks/useApiError';
import { useAuth } from '../../context/AuthContext';
import { DropdownMenu } from '../../components/shared/ui/DropdownMenu';
import { IconButton } from '../../components/shared/ui/IconButton';
import pb from '../../lib/pocketbase';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    created: string;
    avatar?: string;
}

const ROLES = ['Owner', 'SchoolAdmin', 'Teacher', 'Student', 'Parent', 'Individual'];

const UserManagement: React.FC = () => {
    const { handleError } = useApiError();
    const { startImpersonation } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'Student' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const records = await pb.collection('users').getList(1, 50, {
                sort: '-created',
            });
            setUsers(records.items.map(r => ({
                id: r.id,
                name: r.name,
                email: r.email,
                role: r.role,
                created: r.created,
                avatar: r.avatar ? pb.files.getUrl(r, r.avatar) : undefined
            })));
        } catch (error) {
            handleError(error, 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Owner': return 'purple';
            case 'Admin': return 'blue';
            case 'SchoolAdmin': return 'blue';
            case 'Teacher': return 'green';
            case 'Student': return 'orange';
            case 'Parent': return 'pink';
            case 'Individual': return 'cyan';
            default: return 'gray';
        }
    };

    const handleViewProfile = (user: User) => {
        setSelectedUser(user);
        setShowProfileModal(true);
    };

    const handleAddUser = async () => {
        if (!userForm.name || !userForm.email || !userForm.password) {
            alert('Please fill in all required fields');
            return;
        }
        
        setSaving(true);
        try {
            const newUser = await pb.collection('users').create({
                name: userForm.name,
                email: userForm.email,
                password: userForm.password,
                passwordConfirm: userForm.password,
                role: userForm.role,
                emailVisibility: true
            });
            
            setUsers([{
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                created: newUser.created,
                avatar: newUser.avatar ? pb.files.getUrl(newUser, newUser.avatar) : undefined
            }, ...users]);
            
            setShowAddModal(false);
            setUserForm({ name: '', email: '', password: '', role: 'Student' });
        } catch (error: any) {
            handleError(error, 'Failed to create user');
        }
        setSaving(false);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await pb.collection('users').delete(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            handleError(error, 'Failed to delete user');
        }
    };

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all users across the platform</p>
                </div>
                <Button variant="primary" className="bg-[#002366] hover:bg-[#001a4d] text-white border-none shadow-md" onClick={() => setShowAddModal(true)}>
                    <Icon name="PlusIcon" className="w-5 h-5 mr-2" />
                    Add User
                </Button>
            </div>

            <Card className="p-6">
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Icon name="MagnifyingGlassIcon" className="w-5 h-5 text-gray-400" />}
                        />
                    </div>
                    <div className="w-48">
                        <Select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="Owner">Owner</option>
                            <option value="Admin">Admin</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Student">Student</option>
                            <option value="Parent">Parent</option>
                        </Select>
                    </div>
                </div>

                <WidgetErrorBoundary title="User List">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">User</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Role</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">Loading users...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No users found</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-gray-500">{user.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={getRoleColor(user.role) as any}>{user.role}</Badge>
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">
                                                {new Date(user.created).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                    <DropdownMenu
                                                        trigger={<IconButton name="EllipsisHorizontalIcon" />}
                                                        align="right"
                                                        items={[
                                                            {
                                                                label: 'View Profile',
                                                                icon: 'User',
                                                                onClick: () => handleViewProfile(user)
                                                            },
                                                            {
                                                                label: 'Impersonate User',
                                                                icon: 'Eye',
                                                                onClick: async () => {
                                                                    if (window.confirm(`Are you sure you want to impersonate ${user.name}?`)) {
                                                                        try {
                                                                            await startImpersonation(user.id);
                                                                            window.location.href = '/';
                                                                        } catch (e) {
                                                                            alert('Failed to impersonate: ' + e);
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                label: 'Delete User',
                                                                icon: 'Trash',
                                                                onClick: () => handleDeleteUser(user.id),
                                                                danger: true
                                                            }
                                                        ]}
                                                    />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </WidgetErrorBoundary>
            </Card>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New User</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                                <Input
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                                <Input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                                <Input
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                <Select
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                >
                                    {ROLES.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                                <Button variant="primary" onClick={handleAddUser} className="flex-1" disabled={saving}>
                                    {saving ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* User Profile Modal */}
            {showProfileModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Profile</h3>
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-4">
                                {selectedUser.avatar ? (
                                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-500">{selectedUser.name.charAt(0)}</span>
                                )}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h4>
                            <Badge variant={getRoleColor(selectedUser.role) as any} className="mt-2">{selectedUser.role}</Badge>
                        </div>
                        <div className="space-y-3 border-t pt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span className="text-gray-900 dark:text-white">{selectedUser.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">User ID</span>
                                <span className="text-gray-900 dark:text-white font-mono text-sm">{selectedUser.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Joined</span>
                                <span className="text-gray-900 dark:text-white">{new Date(selectedUser.created).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-6">
                            <Button variant="secondary" onClick={() => setShowProfileModal(false)} className="flex-1">Close</Button>
                            <Button 
                                variant="primary" 
                                onClick={async () => {
                                    if (confirm(`Impersonate ${selectedUser.name}?`)) {
                                        await startImpersonation(selectedUser.id);
                                        window.location.href = '/';
                                    }
                                }} 
                                className="flex-1"
                            >
                                Impersonate
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div >
    );
};

export default UserManagement;
