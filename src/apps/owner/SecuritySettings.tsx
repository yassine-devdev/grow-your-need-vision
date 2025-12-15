import React, { useState } from 'react';
import { Card, Icon, Badge, Button } from '../../components/shared/ui/CommonUI';
import { auditLog } from '../../services/auditLogger';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: 'Super Admin' | 'Admin' | 'Support';
    status: 'active' | 'suspended';
    last_login: string;
    mfa_enabled: boolean;
}

interface Permission {
    id: string;
    key: string;
    name: string;
    description: string;
    category: 'tenants' | 'billing' | 'settings' | 'analytics' | 'tools';
    assigned_roles: string[];
}

const SecuritySettings: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([
        {
            id: '1',
            name: 'John Doe',
            email: 'john@growyourneed.com',
            role: 'Super Admin',
            status: 'active',
            last_login: '2 hours ago',
            mfa_enabled: true
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@growyourneed.com',
            role: 'Admin',
            status: 'active',
            last_login: '1 day ago',
            mfa_enabled: true
        },
        {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob@growyourneed.com',
            role: 'Support',
            status: 'active',
            last_login: '3 days ago',
            mfa_enabled: false
        }
    ]);

    const [mfaRequired, setMfaRequired] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState(60); // minutes
    const [ipWhitelist, setIpWhitelist] = useState<string[]>([
        '203.0.113.0/24',
        '198.51.100.42'
    ]);
    const [newIP, setNewIP] = useState('');

    const permissions: Permission[] = [
        {
            id: '1',
            key: 'tenant.create',
            name: 'Create Tenants',
            description: 'Ability to create new tenant accounts',
            category: 'tenants',
            assigned_roles: ['Super Admin', 'Admin']
        },
        {
            id: '2',
            key: 'tenant.delete',
            name: 'Delete Tenants',
            description: 'Ability to permanently delete tenant accounts',
            category: 'tenants',
            assigned_roles: ['Super Admin']
        },
        {
            id: '3',
            key: 'billing.view',
            name: 'View Billing',
            description: 'Access to view invoices and payment information',
            category: 'billing',
            assigned_roles: ['Super Admin', 'Admin']
        },
        {
            id: '4',
            key: 'billing.manage',
            name: 'Manage Billing',
            description: 'Create invoices and process payments',
            category: 'billing',
            assigned_roles: ['Super Admin']
        },
        {
            id: '5',
            key: 'settings.update',
            name: 'Update Settings',
            description: 'Modify platform configuration',
            category: 'settings',
            assigned_roles: ['Super Admin']
        },
        {
            id: '6',
            key: 'analytics.view',
            name: 'View Analytics',
            description: 'Access analytics dashboards',
            category: 'analytics',
            assigned_roles: ['Super Admin', 'Admin', 'Support']
        }
    ];

    const handleToggleMFA = async (staffId: string) => {
        setStaff(staff.map(s =>
            s.id === staffId ? { ...s, mfa_enabled: !s.mfa_enabled } : s
        ));
    };

    const handleToggleStaffStatus = async (staffId: string) => {
        const member = staff.find(s => s.id === staffId);
        if (member) {
            const newStatus = member.status === 'active' ? 'suspended' : 'active';
            setStaff(staff.map(s =>
                s.id === staffId ? { ...s, status: newStatus } : s
            ));
        }
    };

    const handleAddIP = () => {
        if (newIP && !ipWhitelist.includes(newIP)) {
            setIpWhitelist([...ipWhitelist, newIP]);
            setNewIP('');
        }
    };

    const handleRemoveIP = (ip: string) => {
        setIpWhitelist(ipWhitelist.filter(i => i !== ip));
    };

    const handleToggleMFAPolicy = async () => {
        const newValue = !mfaRequired;
        await auditLog.settingsChange('mfa_required', mfaRequired, newValue);
        setMfaRequired(newValue);
    };

    const handleUpdateSessionTimeout = (minutes: number) => {
        setSessionTimeout(minutes);
        auditLog.settingsChange('session_timeout', sessionTimeout, minutes);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Access Control</h2>
                <p className="text-sm text-gray-500 mt-1">Manage owner staff, permissions, and security policies</p>
            </div>

            {/* Security Policies */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Security Policies</h3>

                <div className="space-y-4">
                    {/* MFA Enforcement */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="ShieldCheckIcon" className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">Multi-Factor Authentication</h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Require MFA for all owner staff accounts</p>
                        </div>
                        <button
                            onClick={handleToggleMFAPolicy}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${mfaRequired ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${mfaRequired ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Session Timeout */}
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Icon name="ClockIcon" className="w-5 h-5 text-orange-600" />
                            <h4 className="font-semibold text-gray-900 dark:text-white">Session Timeout</h4>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="15"
                                max="480"
                                step="15"
                                value={sessionTimeout}
                                onChange={(e) => handleUpdateSessionTimeout(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <div className="w-32 text-right">
                                <span className="font-bold text-gray-900 dark:text-white">{sessionTimeout} min</span>
                                <p className="text-xs text-gray-500">
                                    {sessionTimeout < 60 ? `${sessionTimeout} minutes` : `${(sessionTimeout / 60).toFixed(1)} hours`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* IP Whitelist */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Icon name="GlobeAltIcon" className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-gray-900 dark:text-white">IP Whitelist</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Restrict owner dashboard access to specific IP addresses or ranges
                        </p>

                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Enter IP or CIDR range (e.g., 203.0.113.0/24)"
                                value={newIP}
                                onChange={(e) => setNewIP(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                            />
                            <Button variant="primary" onClick={handleAddIP}>Add IP</Button>
                        </div>

                        <div className="space-y-2">
                            {ipWhitelist.map((ip, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <code className="text-sm font-mono text-gray-900 dark:text-white">{ip}</code>
                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveIP(ip)}>
                                        <Icon name="XMarkIcon" className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Owner Staff Management */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Owner Staff</h3>
                    <Button variant="primary">
                        <Icon name="PlusIcon" className="w-4 h-4 mr-2" />
                        Add Staff Member
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MFA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {staff.map((member) => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {member.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={member.role === 'Super Admin' ? 'primary' : 'secondary'}>
                                            {member.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={member.status === 'active' ? 'success' : 'danger'}>
                                            {member.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleMFA(member.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${member.mfa_enabled ? 'bg-green-600' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${member.mfa_enabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {member.last_login}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleStaffStatus(member.id)}
                                        >
                                            {member.status === 'active' ? 'Suspend' : 'Activate'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Permissions Matrix */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Permission Matrix</h3>

                <div className="space-y-4">
                    {['tenants', 'billing', 'settings', 'analytics', 'tools'].map((category) => {
                        const categoryPerms = permissions.filter(p => p.category === category);

                        return (
                            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{category}</h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    {categoryPerms.map((perm) => (
                                        <div key={perm.id} className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-white">{perm.name}</div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{perm.description}</p>
                                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-2 inline-block">
                                                    {perm.key}
                                                </code>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                {perm.assigned_roles.map((role, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Security Log */}
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <div className="flex gap-4">
                    <Icon name="InformationCircleIcon" className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Security Best Practices</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <li>• Require MFA for all owner staff members</li>
                            <li>• Use IP whitelisting for production environments</li>
                            <li>• Set session timeout to maximum 2 hours for security</li>
                            <li>• Review audit logs regularly for suspicious activity</li>
                            <li>• Limit Super Admin role to 1-2 trusted individuals</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SecuritySettings;
