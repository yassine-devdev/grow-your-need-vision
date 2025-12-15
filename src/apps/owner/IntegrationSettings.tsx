import React, { useState } from 'react';
import { Card, Icon, Badge, Button } from '../../components/shared/ui/CommonUI';
import { auditLog } from '../../services/auditLogger';

interface IntegrationConfig {
    id: string;
    name: string;
    category: 'email' | 'analytics' | 'payment' | 'storage';
    provider: string;
    enabled: boolean;
    status: 'connected' | 'disconnected' | 'error';
    config: Record<string, any>;
    last_synced?: string;
}

const IntegrationSettings: React.FC = () => {
    const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
        {
            id: '1',
            name: 'Email Service',
            category: 'email',
            provider: 'SMTP',
            enabled: true,
            status: 'connected',
            config: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                from_email: 'noreply@growyourneed.com',
                from_name: 'Grow Your Need'
            },
            last_synced: '2 hours ago'
        },
        {
            id: '2',
            name: 'Google Analytics',
            category: 'analytics',
            provider: 'Google Analytics 4',
            enabled: true,
            status: 'connected',
            config: {
                tracking_id: 'G-XXXXXXXXX',
                measurement_id: 'G-XXXXXXXXX'
            },
            last_synced: '5 minutes ago'
        },
        {
            id: '3',
            name: 'Stripe Payment',
            category: 'payment',
            provider: 'Stripe',
            enabled: true,
            status: 'connected',
            config: {
                mode: 'live',
                webhook_url: 'https://api.growyourneed.com/webhooks/stripe'
            },
            last_synced: '1 hour ago'
        },
        {
            id: '4',
            name: 'Cloud Storage',
            category: 'storage',
            provider: 'MinIO / S3',
            enabled: true,
            status: 'connected',
            config: {
                endpoint: 'minio.growyourneed.com',
                bucket: 'platform-assets',
                region: 'us-east-1'
            },
            last_synced: '30 minutes ago'
        }
    ]);

    const [activeCategory, setActiveCategory] = useState<'all' | IntegrationConfig['category']>('all');
    const [editingIntegration, setEditingIntegration] = useState<IntegrationConfig | null>(null);

    // Email configuration state
    const [emailConfig, setEmailConfig] = useState({
        provider: 'SMTP',
        host: 'smtp.gmail.com',
        port: '587',
        secure: false,
        username: '',
        password: '',
        from_email: 'noreply@growyourneed.com',
        from_name: 'Grow Your Need'
    });

    // Analytics configuration state
    const [analyticsConfig, setAnalyticsConfig] = useState({
        provider: 'Google Analytics 4',
        tracking_id: '',
        measurement_id: '',
        enable_ecommerce: true,
        enable_user_tracking: true
    });

    // Payment configuration state
    const [paymentConfig, setPaymentConfig] = useState({
        provider: 'Stripe',
        mode: 'test',
        publishable_key: '',
        secret_key: '',
        webhook_secret: '',
        webhook_url: 'https://api.growyourneed.com/webhooks/stripe'
    });

    // Storage configuration state
    const [storageConfig, setStorageConfig] = useState({
        provider: 'MinIO',
        endpoint: 'minio.growyourneed.com',
        access_key: '',
        secret_key: '',
        bucket: 'platform-assets',
        region: 'us-east-1',
        use_ssl: true
    });

    const handleToggleIntegration = async (integrationId: string) => {
        const integration = integrations.find(i => i.id === integrationId);
        if (integration) {
            const newState = !integration.enabled;
            await auditLog.settingsChange(
                `integration.${integration.provider}.enabled`,
                integration.enabled,
                newState
            );
            setIntegrations(integrations.map(i =>
                i.id === integrationId ? { ...i, enabled: newState } : i
            ));
        }
    };

    const handleTestConnection = async (integrationId: string) => {
        const integration = integrations.find(i => i.id === integrationId);
        if (integration) {
            alert(`Testing connection to ${integration.provider}...`);
            // TODO: Implement actual connection test
        }
    };

    const handleSaveEmailConfig = () => {
        console.log('Saving email config:', emailConfig);
        auditLog.settingsChange('integration.email.config', {}, emailConfig);
        alert('Email configuration saved successfully!');
    };

    const handleSaveAnalyticsConfig = () => {
        console.log('Saving analytics config:', analyticsConfig);
        auditLog.settingsChange('integration.analytics.config', {}, analyticsConfig);
        alert('Analytics configuration saved successfully!');
    };

    const handleSavePaymentConfig = () => {
        console.log('Saving payment config:', paymentConfig);
        auditLog.settingsChange('integration.payment.config', {}, paymentConfig);
        alert('Payment configuration saved successfully!');
    };

    const handleSaveStorageConfig = () => {
        console.log('Saving storage config:', storageConfig);
        auditLog.settingsChange('integration.storage.config', {}, storageConfig);
        alert('Storage configuration saved successfully!');
    };

    const filteredIntegrations = integrations.filter(i =>
        activeCategory === 'all' || i.category === activeCategory
    );

    const getCategoryIcon = (category: IntegrationConfig['category']) => {
        switch (category) {
            case 'email': return 'EnvelopeIcon';
            case 'analytics': return 'ChartBarIcon';
            case 'payment': return 'CreditCardIcon';
            case 'storage': return 'CloudIcon';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integration Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Configure external services and APIs</p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={activeCategory === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('all')}
                >
                    All Integrations
                </Button>
                <Button
                    variant={activeCategory === 'email' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('email')}
                >
                    <Icon name="EnvelopeIcon" className="w-4 h-4 mr-2" />
                    Email
                </Button>
                <Button
                    variant={activeCategory === 'analytics' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('analytics')}
                >
                    <Icon name="ChartBarIcon" className="w-4 h-4 mr-2" />
                    Analytics
                </Button>
                <Button
                    variant={activeCategory === 'payment' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('payment')}
                >
                    <Icon name="CreditCardIcon" className="w-4 h-4 mr-2" />
                    Payment
                </Button>
                <Button
                    variant={activeCategory === 'storage' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('storage')}
                >
                    <Icon name="CloudIcon" className="w-4 h-4 mr-2" />
                    Storage
                </Button>
            </div>

            {/* Integrations Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIntegrations.map((integration) => (
                    <Card key={integration.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${integration.category === 'email' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                        integration.category === 'analytics' ? 'bg-orange-100 dark:bg-orange-900/20' :
                                            integration.category === 'payment' ? 'bg-green-100 dark:bg-green-900/20' :
                                                'bg-purple-100 dark:bg-purple-900/20'
                                    }`}>
                                    <Icon name={getCategoryIcon(integration.category)} className={`w-6 h-6 ${integration.category === 'email' ? 'text-blue-600' :
                                            integration.category === 'analytics' ? 'text-orange-600' :
                                                integration.category === 'payment' ? 'text-green-600' :
                                                    'text-purple-600'
                                        }`} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{integration.name}</h4>
                                    <p className="text-sm text-gray-500">{integration.provider}</p>
                                </div>
                            </div>
                            <Badge variant={integration.status === 'connected' ? 'success' : integration.status === 'error' ? 'danger' : 'secondary'}>
                                {integration.status}
                            </Badge>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Enabled</span>
                                <button
                                    onClick={() => handleToggleIntegration(integration.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integration.enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integration.enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {integration.last_synced && (
                                <div className="text-xs text-gray-500">
                                    Last synced: {integration.last_synced}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleTestConnection(integration.id)}
                            >
                                Test
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setEditingIntegration(integration)}
                            >
                                Configure
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Email Configuration Form */}
            {(activeCategory === 'all' || activeCategory === 'email') && (
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Icon name="EnvelopeIcon" className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Email Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                SMTP Host
                            </label>
                            <input
                                type="text"
                                value={emailConfig.host}
                                onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="smtp.gmail.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Port
                            </label>
                            <input
                                type="text"
                                value={emailConfig.port}
                                onChange={(e) => setEmailConfig({ ...emailConfig, port: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="587"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={emailConfig.username}
                                onChange={(e) => setEmailConfig({ ...emailConfig, username: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="your-email@gmail.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password / App Password
                            </label>
                            <input
                                type="password"
                                value={emailConfig.password}
                                onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="••••••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                From Email
                            </label>
                            <input
                                type="email"
                                value={emailConfig.from_email}
                                onChange={(e) => setEmailConfig({ ...emailConfig, from_email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="noreply@yourdomain.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                From Name
                            </label>
                            <input
                                type="text"
                                value={emailConfig.from_name}
                                onChange={(e) => setEmailConfig({ ...emailConfig, from_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="Grow Your Need"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={emailConfig.secure}
                                onChange={(e) => setEmailConfig({ ...emailConfig, secure: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Use TLS/SSL</span>
                        </label>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                        <Button variant="primary" onClick={handleSaveEmailConfig}>
                            Save Email Configuration
                        </Button>
                        <Button variant="outline">Send Test Email</Button>
                    </div>
                </Card>
            )}

            {/* Analytics Configuration Form */}
            {(activeCategory === 'all' || activeCategory === 'analytics') && (
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Icon name="ChartBarIcon" className="w-6 h-6 text-orange-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analytics Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tracking ID (GA4)
                            </label>
                            <input
                                type="text"
                                value={analyticsConfig.tracking_id}
                                onChange={(e) => setAnalyticsConfig({ ...analyticsConfig, tracking_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="G-XXXXXXXXX"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Measurement ID
                            </label>
                            <input
                                type="text"
                                value={analyticsConfig.measurement_id}
                                onChange={(e) => setAnalyticsConfig({ ...analyticsConfig, measurement_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="G-XXXXXXXXX"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 mt-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={analyticsConfig.enable_ecommerce}
                                onChange={(e) => setAnalyticsConfig({ ...analyticsConfig, enable_ecommerce: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Enable E-commerce Tracking</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={analyticsConfig.enable_user_tracking}
                                onChange={(e) => setAnalyticsConfig({ ...analyticsConfig, enable_user_tracking: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Enable User ID Tracking</span>
                        </label>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                        <Button variant="primary" onClick={handleSaveAnalyticsConfig}>
                            Save Analytics Configuration
                        </Button>
                        <Button variant="outline">View Reports</Button>
                    </div>
                </Card>
            )}

            {/* Payment Configuration Form */}
            {(activeCategory === 'all' || activeCategory === 'payment') && (
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Icon name="CreditCardIcon" className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Gateway Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mode
                            </label>
                            <select
                                value={paymentConfig.mode}
                                onChange={(e) => setPaymentConfig({ ...paymentConfig, mode: e.target.value as 'test' | 'live' })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                            >
                                <option value="test">Test Mode</option>
                                <option value="live">Live Mode</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Publishable Key
                            </label>
                            <input
                                type="text"
                                value={paymentConfig.publishable_key}
                                onChange={(e) => setPaymentConfig({ ...paymentConfig, publishable_key: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="pk_test_..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Secret Key
                            </label>
                            <input
                                type="password"
                                value={paymentConfig.secret_key}
                                onChange={(e) => setPaymentConfig({ ...paymentConfig, secret_key: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="sk_test_..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Webhook Secret
                            </label>
                            <input
                                type="password"
                                value={paymentConfig.webhook_secret}
                                onChange={(e) => setPaymentConfig({ ...paymentConfig, webhook_secret: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="whsec_..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Webhook URL
                            </label>
                            <input
                                type="text"
                                value={paymentConfig.webhook_url}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                        <Button variant="primary" onClick={handleSavePaymentConfig}>
                            Save Payment Configuration
                        </Button>
                        <Button variant="outline">Test Connection</Button>
                    </div>
                </Card>
            )}

            {/* Storage Configuration Form */}
            {(activeCategory === 'all' || activeCategory === 'storage') && (
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Icon name="CloudIcon" className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cloud Storage Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Endpoint
                            </label>
                            <input
                                type="text"
                                value={storageConfig.endpoint}
                                onChange={(e) => setStorageConfig({ ...storageConfig, endpoint: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="minio.yourdomain.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Region
                            </label>
                            <input
                                type="text"
                                value={storageConfig.region}
                                onChange={(e) => setStorageConfig({ ...storageConfig, region: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="us-east-1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Access Key
                            </label>
                            <input
                                type="text"
                                value={storageConfig.access_key}
                                onChange={(e) => setStorageConfig({ ...storageConfig, access_key: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="AKIA..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Secret Key
                            </label>
                            <input
                                type="password"
                                value={storageConfig.secret_key}
                                onChange={(e) => setStorageConfig({ ...storageConfig, secret_key: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="••••••••••••"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Bucket Name
                            </label>
                            <input
                                type="text"
                                value={storageConfig.bucket}
                                onChange={(e) => setStorageConfig({ ...storageConfig, bucket: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="platform-assets"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={storageConfig.use_ssl}
                                onChange={(e) => setStorageConfig({ ...storageConfig, use_ssl: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Use SSL/TLS</span>
                        </label>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                        <Button variant="primary" onClick={handleSaveStorageConfig}>
                            Save Storage Configuration
                        </Button>
                        <Button variant="outline">Test Connection</Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default IntegrationSettings;
