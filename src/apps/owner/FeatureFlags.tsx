import React, { useState, useEffect } from 'react';
import { Card, Icon, Badge, Button } from '../../components/shared/ui/CommonUI';
import { auditLog } from '../../services/auditLogger';

interface FeatureFlag {
    id: string;
    name: string;
    key: string;
    description: string;
    enabled: boolean;
    category: 'core' | 'ai' | 'payment' | 'communication' | 'analytics' | 'overlay';
    rollout_percentage: number;
    plan_restrictions: string[];
    created: string;
    updated: string;
}

const FeatureFlags: React.FC = () => {
    const [flags, setFlags] = useState<FeatureFlag[]>([
        {
            id: '1',
            name: 'AI Features',
            key: 'enable_ai_features',
            description: 'Enable AI-powered content generation, chatbots, and intelligent recommendations',
            enabled: true,
            category: 'ai',
            rollout_percentage: 100,
            plan_restrictions: ['Premium', 'Enterprise'],
            created: '2024-01-01',
            updated: '2024-01-15'
        },
        {
            id: '2',
            name: 'Payment Processing',
            key: 'enable_payment_processing',
            description: 'Allow tenants to accept payments through Stripe and PayPal',
            enabled: true,
            category: 'payment',
            rollout_percentage: 100,
            plan_restrictions: [],
            created: '2024-01-01',
            updated: '2024-01-10'
        },
        {
            id: '3',
            name: 'Advanced Analytics',
            key: 'enable_advanced_analytics',
            description: 'Detailed analytics dashboards with custom reports and data export',
            enabled: true,
            category: 'analytics',
            rollout_percentage: 80,
            plan_restrictions: ['Premium', 'Enterprise'],
            created: '2024-01-01',
            updated: '2024-01-20'
        },
        {
            id: '4',
            name: 'Video Streaming',
            key: 'enable_video_streaming',
            description: 'Live TV and video streaming capabilities in Media overlay',
            enabled: false,
            category: 'overlay',
            rollout_percentage: 0,
            plan_restrictions: ['Enterprise'],
            created: '2024-01-05',
            updated: '2024-01-05'
        },
        {
            id: '5',
            name: 'Email Campaigns',
            key: 'enable_email_campaigns',
            description: 'Bulk email campaigns and automated drip sequences',
            enabled: true,
            category: 'communication',
            rollout_percentage: 100,
            plan_restrictions: [],
            created: '2024-01-01',
            updated: '2024-01-12'
        },
        {
            id: '6',
            name: 'Gamification Engine',
            key: 'enable_gamification',
            description: 'Badges, achievements, leaderboards, and reward systems',
            enabled: true,
            category: 'overlay',
            rollout_percentage: 100,
            plan_restrictions: [],
            created: '2024-01-01',
            updated: '2024-01-18'
        },
        {
            id: '7',
            name: 'Real-time Collaboration',
            key: 'enable_realtime_collaboration',
            description: 'WebSocket-based real-time editing and collaboration features',
            enabled: false,
            category: 'core',
            rollout_percentage: 25,
            plan_restrictions: ['Premium', 'Enterprise'],
            created: '2024-01-10',
            updated: '2024-01-20'
        },
        {
            id: '8',
            name: 'Multi-language Support',
            key: 'enable_i18n',
            description: 'Internationalization with automatic translation',
            enabled: false,
            category: 'core',
            rollout_percentage: 0,
            plan_restrictions: ['Enterprise'],
            created: '2024-01-15',
            updated: '2024-01-15'
        }
    ]);

    const [filter, setFilter] = useState<'all' | FeatureFlag['category']>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleToggleFlag = async (flagId: string) => {
        const flag = flags.find(f => f.id === flagId);
        if (!flag) return;

        const newState = !flag.enabled;

        // Log the change
        await auditLog.featureFlagChange(flag.key, newState);

        setFlags(flags.map(f =>
            f.id === flagId
                ? { ...f, enabled: newState, updated: new Date().toISOString() }
                : f
        ));
    };

    const handleUpdateRollout = (flagId: string, percentage: number) => {
        setFlags(flags.map(f =>
            f.id === flagId
                ? { ...f, rollout_percentage: percentage, updated: new Date().toISOString() }
                : f
        ));
    };

    const handleUpdatePlanRestrictions = (flagId: string, plans: string[]) => {
        setFlags(flags.map(f =>
            f.id === flagId
                ? { ...f, plan_restrictions: plans, updated: new Date().toISOString() }
                : f
        ));
    };

    const filteredFlags = flags.filter(flag => {
        const matchesCategory = filter === 'all' || flag.category === filter;
        const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flag.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getCategoryIcon = (category: FeatureFlag['category']) => {
        switch (category) {
            case 'ai': return 'SparklesIcon';
            case 'payment': return 'CreditCardIcon';
            case 'communication': return 'ChatBubbleLeftRightIcon';
            case 'analytics': return 'ChartBarIcon';
            case 'overlay': return 'Squares2X2Icon';
            case 'core': return 'CogIcon';
            default: return 'FlagIcon';
        }
    };

    const getCategoryColor = (category: FeatureFlag['category']) => {
        switch (category) {
            case 'ai': return 'purple';
            case 'payment': return 'green';
            case 'communication': return 'blue';
            case 'analytics': return 'orange';
            case 'overlay': return 'pink';
            case 'core': return 'gray';
            default: return 'gray';
        }
    };

    const stats = {
        total: flags.length,
        enabled: flags.filter(f => f.enabled).length,
        disabled: flags.filter(f => !f.enabled).length,
        gradual: flags.filter(f => f.rollout_percentage > 0 && f.rollout_percentage < 100).length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Flags</h2>
                    <p className="text-sm text-gray-500 mt-1">Control platform features and rollout strategies</p>
                </div>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Icon name="PlusIcon" className="w-4 h-4 mr-2" />
                    Create Flag
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Flags</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                        </div>
                        <Icon name="FlagIcon" className="w-10 h-10 text-blue-500" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Enabled</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.enabled}</p>
                        </div>
                        <Icon name="CheckCircleIcon" className="w-10 h-10 text-green-500" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Disabled</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{stats.disabled}</p>
                        </div>
                        <Icon name="XCircleIcon" className="w-10 h-10 text-red-500" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Gradual Rollout</p>
                            <p className="text-2xl font-bold text-orange-600 mt-1">{stats.gradual}</p>
                        </div>
                        <Icon name="ChartBarIcon" className="w-10 h-10 text-orange-500" />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Icon name="MagnifyingGlassIcon" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search flags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={filter === 'all' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            All
                        </Button>
                        <Button
                            variant={filter === 'core' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('core')}
                        >
                            Core
                        </Button>
                        <Button
                            variant={filter === 'ai' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('ai')}
                        >
                            AI
                        </Button>
                        <Button
                            variant={filter === 'payment' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('payment')}
                        >
                            Payment
                        </Button>
                        <Button
                            variant={filter === 'communication' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('communication')}
                        >
                            Communication
                        </Button>
                        <Button
                            variant={filter === 'analytics' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('analytics')}
                        >
                            Analytics
                        </Button>
                        <Button
                            variant={filter === 'overlay' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('overlay')}
                        >
                            Overlay
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Feature Flags List */}
            <div className="space-y-4">
                {filteredFlags.map((flag) => (
                    <Card key={flag.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${getCategoryColor(flag.category)}-100 dark:bg-${getCategoryColor(flag.category)}-900/20`}>
                                    <Icon name={getCategoryIcon(flag.category)} className={`w-6 h-6 text-${getCategoryColor(flag.category)}-600`} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{flag.name}</h3>
                                        <Badge variant="secondary" className="text-xs">{flag.category}</Badge>
                                        {flag.rollout_percentage < 100 && flag.rollout_percentage > 0 && (
                                            <Badge variant="warning" className="text-xs">
                                                {flag.rollout_percentage}% Rollout
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{flag.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Key: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{flag.key}</code></span>
                                        {flag.plan_restrictions.length > 0 && (
                                            <span>
                                                Plans: {flag.plan_restrictions.map((plan, idx) => (
                                                    <Badge key={idx} variant="secondary" className="ml-1 text-xs">{plan}</Badge>
                                                ))}
                                            </span>
                                        )}
                                        <span>Updated: {new Date(flag.updated).toLocaleDateString()}</span>
                                    </div>

                                    {/* Rollout Slider for gradual deployment */}
                                    {flag.enabled && (
                                        <div className="mt-4">
                                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Rollout Percentage: {flag.rollout_percentage}%
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                value={flag.rollout_percentage}
                                                onChange={(e) => handleUpdateRollout(flag.id, parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>0%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggleFlag(flag.id)}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${flag.enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <Button variant="ghost" size="sm">
                                    <Icon name="PencilIcon" className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredFlags.length === 0 && (
                <Card className="p-12 text-center">
                    <Icon name="FlagIcon" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No feature flags found matching your criteria</p>
                </Card>
            )}
        </div>
    );
};

export default FeatureFlags;
