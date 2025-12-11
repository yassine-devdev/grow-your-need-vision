import React, { useState, useEffect } from 'react';
import { OwnerIcon } from '../../components/shared/OwnerIcons';
import { tenantService, Tenant } from '../../services/tenantService';
import { User } from '../../context/AuthContext';
import { ticketService, Ticket } from '../../services/ticketService';
import { Button } from '../../components/shared/ui/Button';
import { Avatar } from '../../components/shared/ui/Avatar';
import { Badge } from '../../components/shared/ui/Badge';
import { Table, Thead, Tr, Th, Td } from '../../components/shared/ui/Table';
import { Input } from '../../components/shared/ui/Input';
import { Select } from '../../components/shared/ui/Select';

interface SchoolDetailProps {
    tenantId: string;
    onBack: () => void;
}

export const SchoolDetail: React.FC<SchoolDetailProps> = ({ tenantId, onBack }) => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTab, setActiveTab] = useState<'Overview' | 'Users' | 'Branding' | 'Billing' | 'Support'>('Overview');
    const [loading, setLoading] = useState(true);

    // User Form State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('Student');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tData, uData, tickData] = await Promise.all([
                    tenantService.getTenantById(tenantId),
                    tenantService.getTenantUsers(tenantId),
                    ticketService.getTicketsByTenant(tenantId)
                ]);
                setTenant(tData);
                setUsers(uData.items as unknown as User[]);
                setTickets(tickData);
            } catch (error) {
                console.error("Failed to fetch school details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tenantId]);

    const handleAddUser = async () => {
        if (!newUserEmail) return;
        try {
            const newUser = await tenantService.addTenantUser(tenantId, {
                email: newUserEmail,
                role: newUserRole as User['role'],
                name: newUserEmail.split('@')[0], // Placeholder name
                status: 'active',
                username: newUserEmail.split('@')[0] + Math.floor(Math.random() * 1000)
            });
            if (newUser) {
                setUsers([newUser as unknown as User, ...users]);
            }
            setNewUserEmail('');
        } catch (error) {
            alert("Failed to add user");
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (confirm('Are you sure you want to remove this user?')) {
            await tenantService.removeTenantUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        }
    };

    if (loading || !tenant) {
        return <div className="p-12 text-center">Loading school details...</div>;
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={onBack} leftIcon={<OwnerIcon name="ArrowLeftIcon" className="w-4 h-4" />}>
                    Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        {tenant.name}
                        <Badge variant={tenant.status === 'active' ? 'success' : 'warning'}>{tenant.status}</Badge>
                    </h1>
                    <p className="text-gray-500 text-sm">{tenant.domain} • {tenant.contact_email}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary">Edit School</Button>
                    <Button variant="primary">Login as Admin</Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {['Overview', 'Users', 'Branding', 'Billing', 'Support'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as 'Overview' | 'Users' | 'Branding' | 'Billing' | 'Support')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                            activeTab === tab 
                            ? 'border-gyn-blue-dark text-gyn-blue-dark' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[400px] p-6">
                
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <h3 className="text-blue-800 font-bold text-sm uppercase mb-2">Total Users</h3>
                            <div className="text-3xl font-black text-blue-900">{users.length}</div>
                        </div>
                        <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                            <h3 className="text-green-800 font-bold text-sm uppercase mb-2">Active Plan</h3>
                            <div className="text-3xl font-black text-green-900">{tenant.subscription_plan}</div>
                        </div>
                        <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                            <h3 className="text-purple-800 font-bold text-sm uppercase mb-2">Open Tickets</h3>
                            <div className="text-3xl font-black text-purple-900">{tickets.filter(t => t.status === 'Open').length}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'Users' && (
                    <div className="space-y-6">
                        <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex-1">
                                <Input 
                                    label="Add User Email" 
                                    placeholder="user@school.edu" 
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                />
                            </div>
                            <div className="w-48">
                                <Select 
                                    label="Role"
                                    value={newUserRole}
                                    onChange={e => setNewUserRole(e.target.value)}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Parent">Parent</option>
                                </Select>
                            </div>
                            <Button variant="primary" onClick={handleAddUser} className="bg-[#002366] hover:bg-[#001a4d] text-white border-none shadow-md">Add User</Button>
                        </div>

                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>User</Th>
                                    <Th>Role</Th>
                                    <Th>Status</Th>
                                    <Th className="text-right">Actions</Th>
                                </Tr>
                            </Thead>
                            <tbody>
                                {users.map(user => (
                                    <Tr key={user.id}>
                                        <Td>
                                            <div className="flex items-center gap-3">
                                                <Avatar initials={user.name.substring(0,2)} />
                                                <div>
                                                    <div className="font-bold text-sm">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td><Badge variant="neutral">{user.role}</Badge></Td>
                                        <Td><Badge variant={user.status === 'Active' ? 'success' : 'neutral'}>{user.status}</Badge></Td>
                                        <Td className="text-right">
                                            <button 
                                                onClick={() => handleRemoveUser(user.id)}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                                            >
                                                Remove
                                            </button>
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}

                {activeTab === 'Branding' && (
                    <div className="max-w-2xl space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200" style={{background: tenant.branding?.primaryColor}}></div>
                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{tenant.branding?.primaryColor || 'Default'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Secondary Color</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200" style={{background: tenant.branding?.secondaryColor}}></div>
                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{tenant.branding?.secondaryColor || 'Default'}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Custom Domain</label>
                            <div className="flex gap-2">
                                <Input value={tenant.domain} readOnly className="bg-gray-50" />
                                <Button variant="secondary">Verify DNS</Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Billing' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Current Plan</h3>
                                <div className="text-3xl font-black">{tenant.subscription_plan}</div>
                                <div className="text-sm text-gray-400 mt-2">Next billing date: {new Date().toLocaleDateString()}</div>
                            </div>
                            <Button variant="primary" className="bg-white text-black hover:bg-gray-200 border-none">Upgrade Plan</Button>
                        </div>

                        <h3 className="font-bold text-lg text-gray-800 mt-8">Invoice History</h3>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Date</Th>
                                    <Th>Amount</Th>
                                    <Th>Status</Th>
                                    <Th className="text-right">Download</Th>
                                </Tr>
                            </Thead>
                            <tbody>
                                <Tr>
                                    <Td>Oct 01, 2023</Td>
                                    <Td>$299.00</Td>
                                    <Td><Badge variant="success">Paid</Badge></Td>
                                    <Td className="text-right"><Button variant="ghost" size="sm">PDF</Button></Td>
                                </Tr>
                                <Tr>
                                    <Td>Sep 01, 2023</Td>
                                    <Td>$299.00</Td>
                                    <Td><Badge variant="success">Paid</Badge></Td>
                                    <Td className="text-right"><Button variant="ghost" size="sm">PDF</Button></Td>
                                </Tr>
                            </tbody>
                        </Table>
                    </div>
                )}

                {activeTab === 'Support' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Support Tickets</h3>
                            <Button variant="primary" size="sm">Create Ticket</Button>
                        </div>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Subject</Th>
                                    <Th>Priority</Th>
                                    <Th>Status</Th>
                                    <Th>Created</Th>
                                </Tr>
                            </Thead>
                            <tbody>
                                {tickets.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={4} className="text-center text-gray-500 py-8">No tickets found</Td>
                                    </Tr>
                                ) : (
                                    tickets.map(ticket => (
                                        <Tr key={ticket.id}>
                                            <Td className="font-bold">{ticket.subject}</Td>
                                            <Td><Badge variant={ticket.priority === 'Critical' ? 'danger' : 'neutral'}>{ticket.priority}</Badge></Td>
                                            <Td><Badge variant={ticket.status === 'Resolved' ? 'success' : 'warning'}>{ticket.status}</Badge></Td>
                                            <Td>{new Date(ticket.created).toLocaleDateString()}</Td>
                                        </Tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}

            </div>
        </div>
    );
};
