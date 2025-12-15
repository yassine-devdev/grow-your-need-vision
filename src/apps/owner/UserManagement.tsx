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

const UserManagement: React.FC = () => {
    const { handleError } = useApiError();
    const { startImpersonation } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

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
            case 'Teacher': return 'green';
            case 'Student': return 'orange';
            case 'Parent': return 'pink';
            default: return 'gray';
        }
    };

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all users across the platform</p>
                </div>
                <Button variant="primary" className="bg-[#002366] hover:bg-[#001a4d] text-white border-none shadow-md">
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
                                                <td className="p-4 text-right">
                                                    <DropdownMenu
                                                        trigger={<IconButton name="EllipsisHorizontalIcon" />}
                                                        align="right"
                                                        items={[
                                                            {
                                                                label: 'View Profile',
                                                                icon: 'User',
                                                                onClick: () => console.log('View profile', user.id)
                                                            },
                                                            {
                                                                label: 'Impersonate User',
                                                                icon: 'Eye',
                                                                onClick: async () => {
                                                                    // Use a direct window confirm for safety
                                                                    if (window.confirm(`Are you sure you want to impersonate ${user.name}?`)) {
                                                                        try {
                                                                            // We need to access startImpersonation from useAuth, but hooks rule prevents call here
                                                                            // So we will pass a handler or use hook at top level.
                                                                            // Wait, I can't access `startImpersonation` here because I'm inside map.
                                                                            // I need to use the one from top level.
                                                                            await startImpersonation(user.id);
                                                                            // Force reload to dashboard
                                                                            window.location.href = '/';
                                                                        } catch (e) {
                                                                            alert('Failed to impersonate: ' + e);
                                                                        }
                                                                    }
                                                                }
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
        </div >
    );
};

export default UserManagement;
