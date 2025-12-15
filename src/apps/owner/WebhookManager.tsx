import React from 'react';
import { Card, Icon, Badge, Button } from '../../components/shared/ui/CommonUI';
import { useWebhooks, useTestWebhook } from '../../hooks/usePhase2Data';

const WebhookManager: React.FC = () => {
    const { data: webhooks, isLoading, error } = useWebhooks();
    const testMutation = useTestWebhook();

    const handleTest = async (id: string) => {
        try {
            await testMutation.mutateAsync(id);
            alert('Webhook test successful!');
        } catch (error) {
            alert('Webhook test failed');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                <p className="text-red-800 dark:text-red-200">Failed to load webhooks. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Webhook Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Configure webhooks for real-time event notifications</p>
                </div>
                <Button variant="primary">
                    <Icon name="PlusIcon" className="w-4 h-4 mr-2" />
                    Add Webhook
                </Button>
            </div>

            {/* Webhooks List */}
            <div className="space-y-4">
                {webhooks?.map((webhook) => (
                    <Card key={webhook.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{webhook.name}</h3>
                                    <Badge variant={webhook.status === 'active' ? 'success' : webhook.status === 'paused' ? 'warning' : 'danger'}>
                                        {webhook.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-3">{webhook.url}</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Icon name="BoltIcon" className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{Array.isArray(webhook.events) ? webhook.events.length : JSON.parse(webhook.events as any).length} events</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon name="ClockIcon" className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Last: {webhook.last_triggered ? new Date(webhook.last_triggered).toLocaleString() : 'Never'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon name="ChartBarIcon" className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{webhook.success_rate?.toFixed(1) || 0}% success</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTest(webhook.id)}
                                    disabled={testMutation.isPending}
                                >
                                    <Icon name="PlayIcon" className="w-4 h-4 mr-1" />
                                    {testMutation.isPending ? 'Testing...' : 'Test'}
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Icon name="PencilIcon" className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(Array.isArray(webhook.events) ? webhook.events : JSON.parse(webhook.events as any)).map((event: string, idx: number) => (
                                <Badge key={idx} variant="neutral">{event}</Badge>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Info */}
            <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200">
                <div className="flex gap-3">
                    <Icon name="ShieldCheckIcon" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-green-900 dark:text-green-100">Secure Webhooks</p>
                        <p className="text-green-700 dark:text-green-200">All webhooks include HMAC signatures for verification</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default WebhookManager;
