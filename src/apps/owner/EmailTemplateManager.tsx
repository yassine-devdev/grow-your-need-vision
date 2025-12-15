import React, { useState } from 'react';
import { Card, Icon, Badge, Button } from '../../components/shared/ui/CommonUI';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    category: 'welcome' | 'notification' | 'billing' | 'marketing' | 'system';
    status: 'active' | 'draft';
    last_updated: string;
    usage_count: number;
}

const EmailTemplateManager: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([
        {
            id: '1',
            name: 'Welcome Email',
            subject: 'Welcome to {{platform_name}}!',
            category: 'welcome',
            status: 'active',
            last_updated: '2024-01-15',
            usage_count: 1250
        },
        {
            id: '2',
            name: 'Payment Confirmation',
            subject: 'Payment Received - Invoice #{{invoice_number}}',
            category: 'billing',
            status: 'active',
            last_updated: '2024-01-10',
            usage_count: 856
        },
        {
            id: '3',
            name: 'Feature Announcement',
            subject: 'New Feature: {{feature_name}}',
            category: 'marketing',
            status: 'draft',
            last_updated: '2024-01-20',
            usage_count: 0
        }
    ]);

    const getCategoryColor = (category: EmailTemplate['category']) => {
        const colors = {
            welcome: 'blue',
            notification: 'green',
            billing: 'orange',
            marketing: 'purple',
            system: 'red'
        };
        return colors[category];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Templates</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage automated email templates with variables</p>
                </div>
                <Button variant="primary">
                    <Icon name="PlusIcon" className="w-4 h-4 mr-2" />
                    Create Template
                </Button>
            </div>

            {/* Templates List */}
            <div className="space-y-4">
                {templates.map((template) => (
                    <Card key={template.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{template.name}</h3>
                                    <Badge variant={template.category === 'welcome' ? 'primary' : 'secondary'}>
                                        {template.category}
                                    </Badge>
                                    <Badge variant={template.status === 'active' ? 'success' : 'warning'}>
                                        {template.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    <strong>Subject:</strong> {template.subject}
                                </p>
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span>Last updated: {new Date(template.last_updated).toLocaleDateString()}</span>
                                    <span>Used {template.usage_count} times</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Icon name="EyeIcon" className="w-4 h-4 mr-1" />
                                    Preview
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Icon name="PencilIcon" className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Icon name="DocumentDuplicateIcon" className="w-4 h-4 mr-1" />
                                    Clone
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Variables Info */}
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200">
                <div className="flex gap-3">
                    <Icon name="CodeBracketIcon" className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-purple-900 dark:text-purple-100">Available Variables</p>
                        <p className="text-purple-700 dark:text-purple-200">{{ tenant_name }}, {{ user_name }}, {{ platform_name }}, {{ invoice_number }}, {{ amount }}, {{ date }}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default EmailTemplateManager;
