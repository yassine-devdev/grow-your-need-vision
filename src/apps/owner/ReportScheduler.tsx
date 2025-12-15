import React from 'react';
import { Card, Icon, Badge, Button } from '../../components/shared/ui/CommonUI';
import { useScheduledReports, useRunReport } from '../../hooks/usePhase2Data';

const ReportScheduler: React.FC = () => {
    const { data: reports, isLoading, error } = useScheduledReports();
    const runMutation = useRunReport();

    const handleRunNow = async (id: string, name: string) => {
        try {
            await runMutation.mutateAsync(id);
            alert(`Report "${name}" started successfully!`);
        } catch (error) {
            alert('Failed to run report');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                <p className="text-red-800 dark:text-red-200">Failed to load scheduled reports. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Report Scheduling</h2>
                    <p className="text-sm text-gray-500 mt-1">Automate report generation and distribution</p>
                </div>
                <Button variant="primary">
                    <Icon name="PlusIcon" className="w-4 h-4 mr-2" />
                    Schedule Report
                </Button>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {reports?.map((report) => {
                    const recipients = Array.isArray(report.recipients) ? report.recipients : JSON.parse(report.recipients as any);
                    return (
                        <Card key={report.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{report.name}</h3>
                                        <Badge variant={report.status === 'active' ? 'success' : 'warning'}>
                                            {report.status}
                                        </Badge>
                                        <Badge variant="neutral">{report.frequency}</Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                        <div>
                                            <span className="text-gray-600">Type:</span>
                                            <span className="ml-2 font-medium">{report.type}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Format:</span>
                                            <span className="ml-2 font-medium uppercase">{report.format}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Next run:</span>
                                            <span className="ml-2 font-medium">{new Date(report.next_run).toLocaleString()}</span>
                                        </div>
                                        {report.last_run && (
                                            <div>
                                                <span className="text-gray-600">Last run:</span>
                                                <span className="ml-2 font-medium">{new Date(report.last_run).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-sm">
                                        <span className="text-gray-600">Recipients:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {recipients.map((email: string, idx: number) => (
                                                <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                                    {email}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRunNow(report.id, report.name)}
                                        disabled={runMutation.isPending}
                                    >
                                        <Icon name="PlayIcon" className="w-4 h-4 mr-1" />
                                        {runMutation.isPending ? 'Running...' : 'Run Now'}
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Icon name="PencilIcon" className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Info */}
            <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200">
                <div className="flex gap-3">
                    <Icon name="CalendarIcon" className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-orange-900 dark:text-orange-100">Automated Delivery</p>
                        <p className="text-orange-700 dark:text-orange-200">Reports are automatically generated and emailed at scheduled times</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReportScheduler;
