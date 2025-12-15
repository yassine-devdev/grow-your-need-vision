import React, { useState } from 'react';
import { Card, Icon, Button, Badge } from '../../components/shared/ui/CommonUI';
import {
    useEmailHistory,
    useEmailTemplates,
    useSendEmail,
    useCreateTemplate
} from '../../hooks/useCRMEmails';
import { useContacts } from '../../hooks/useCRMContacts';
import { CRMContact } from '../../services/crmContactsService';
import { Email, EmailTemplate } from '../../services/crmEmailService';

const EmailIntegration: React.FC = () => {
    const [selectedContact, setSelectedContact] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'templates' | 'analytics'>('compose');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    // Hooks
    const { data: contacts, isLoading: contactsLoading } = useContacts();
    const { data: history, isLoading: historyLoading } = useEmailHistory(selectedContact);
    const { data: templates, isLoading: templatesLoading } = useEmailTemplates();
    const { mutateAsync: sendEmail, isPending: sending } = useSendEmail();
    const { mutateAsync: createTemplate } = useCreateTemplate();

    const contact = contacts?.find((c: CRMContact) => c.id === selectedContact);

    const handleSend = async () => {
        if (!contact || !subject || !body) return;

        try {
            await sendEmail({
                to: contact.email,
                subject,
                body,
                options: { contactId: contact.id }
            });

            setSubject('');
            setBody('');
            setActiveTab('history');
        } catch (err) {
            console.error(err);
            alert('Failed to send email');
        }
    };

    const applyTemplate = (templateId: string) => {
        const template = templates?.find((t: EmailTemplate) => t.id === templateId);
        if (template && contact) {
            let newSubject = template.subject_template;
            let newBody = template.body_template;

            const replacements: Record<string, string> = {
                '{{first_name}}': contact.first_name,
                '{{last_name}}': contact.last_name,
                '{{email}}': contact.email,
                '{{company}}': contact.company || 'your company',
                '{{phone}}': contact.phone || ''
            };

            Object.entries(replacements).forEach(([key, value]) => {
                newSubject = newSubject.replaceAll(key, value);
                newBody = newBody.replaceAll(key, value);
            });

            setSubject(newSubject);
            setBody(newBody);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Sidebar */}
            <Card className="col-span-1 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Contact</label>
                    <select
                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        value={selectedContact}
                        onChange={(e) => setSelectedContact(e.target.value)}
                    >
                        <option value="">-- Choose a contact --</option>
                        {contacts?.map((c: CRMContact) => (
                            <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                        ))}
                    </select>
                </div>

                <div className="p-2 space-y-1 flex-1 overflow-y-auto">
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeTab === 'compose' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <Icon name="PencilSquareIcon" className="w-5 h-5" />
                        Compose Email
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeTab === 'history' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        disabled={!selectedContact}
                    >
                        <Icon name="ClockIcon" className="w-5 h-5" />
                        History
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeTab === 'templates' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <Icon name="DocumentDuplicateIcon" className="w-5 h-5" />
                        Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`w-full text-left p-3 rounded flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <Icon name="ChartBarIcon" className="w-5 h-5" />
                        Analytics
                    </button>
                </div>
            </Card>

            {/* Main Content */}
            <Card className="col-span-2 h-full flex flex-col p-6">
                {activeTab === 'compose' && (
                    <div className="flex-1 flex flex-col space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">New Message</h3>
                            <select
                                className="text-sm p-1 rounded border dark:bg-gray-800"
                                onChange={(e) => applyTemplate(e.target.value)}
                                disabled={!selectedContact}
                            >
                                <option value="">Load Template...</option>
                                {templates?.map((t: EmailTemplate) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {!selectedContact ? (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                Select a contact to start composing
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                                <textarea
                                    className="flex-1 w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent resize-none"
                                    placeholder="Write your email content..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => { }}>Save Draft</Button>
                                    <Button variant="primary" icon="PaperAirplaneIcon" onClick={handleSend} disabled={sending}>
                                        {sending ? 'Sending...' : 'Send Email'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-4">Conversation History</h3>
                        {!selectedContact ? (
                            <div className="text-center text-gray-500 py-10">Select a contact to view history</div>
                        ) : historyLoading ? (
                            <div>Loading history...</div>
                        ) : history?.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">No emails found</div>
                        ) : (
                            <div className="space-y-4 overflow-y-auto max-h-[600px]">
                                {history?.map((email: Email) => (
                                    <div key={email.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold">{email.subject}</span>
                                            <span className="text-xs text-gray-500">{new Date(email.sent_at || email.created).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{email.body}</p>
                                        <div className="mt-2 flex gap-2">
                                            <Badge variant={email.status === 'opened' ? 'success' : 'neutral'} size="sm">
                                                {email.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Email Templates</h3>
                            <Button variant="primary" icon="PlusIcon">New Template</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates?.map((t: EmailTemplate) => (
                                <div key={t.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                                    <h4 className="font-bold mb-1">{t.name}</h4>
                                    <div className="text-xs text-gray-500 mb-2">{t.category}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{t.subject_template}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <h3 className="font-bold text-lg">Email Performance</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">24.5%</div>
                                <div className="text-sm text-gray-500">Open Rate</div>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">12.8%</div>
                                <div className="text-sm text-gray-500">Click Rate</div>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                <div className="text-2xl font-bold text-purple-600">342</div>
                                <div className="text-sm text-gray-500">Total Sent</div>
                            </div>
                        </div>
                        <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded flex items-center justify-center text-gray-400">
                            Chart Placeholder (Engagement over time)
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default EmailIntegration;
