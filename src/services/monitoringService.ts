import env from '../config/environment';

export interface AlertData {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    metadata?: Record<string, any>;
    service?: string;
}

class MonitoringService {
    private slackWebhookUrl: string | boolean | undefined;

    constructor() {
        // Use a valid environment key or hardcode/fallback
        this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || undefined;
    }

    /**
     * Send a notification to Slack
     */
    async sendAlert(data: AlertData): Promise<boolean> {
        if (!this.slackWebhookUrl) {
            if (import.meta.env.DEV) {
                console.warn('[MonitoringService] Slack Webhook URL not configured. Skipping alert:', data);
            }
            return false;
        }

        try {
            const color = data.severity === 'critical' ? '#FF0000' : data.severity === 'warning' ? '#FFA500' : '#36a64f';

            const payload = {
                attachments: [
                    {
                        fallback: `${data.severity.toUpperCase()}: ${data.title} - ${data.message}`,
                        color: color,
                        title: data.title,
                        text: data.message,
                        fields: [
                            {
                                title: 'Severity',
                                value: data.severity,
                                short: true
                            },
                            {
                                title: 'Service',
                                value: data.service || 'System',
                                short: true
                            }
                        ],
                        footer: 'Grow Your Need Monitoring',
                        ts: Math.floor(Date.now() / 1000),
                        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined
                    }
                ]  
            };

            const response = await fetch(this.slackWebhookUrl as string, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            return response.ok;
        } catch (error) {
            console.error('[MonitoringService] Failed to send Slack alert:', error);
            return false;
        }
    }

    /**
     * Notify critical audit event
     */
    async notifyCriticalAudit(action: string, metadata: any): Promise<void> {
        await this.sendAlert({
            title: `Critical Audit Event: ${action}`,
            message: `A critical action was performed on the system.`,
            severity: 'critical',
            metadata,
            service: 'AuditLogger'
        });
    }

    /**
     * Notify system incident
     */
    async notifyIncident(service: string, status: string, message: string): Promise<void> {
        await this.sendAlert({
            title: `System Incident: ${service} is ${status}`,
            message: message,
            severity: status === 'down' ? 'critical' : 'warning',
            service: 'SystemHealth'
        });
    }
}

export const monitoringService = new MonitoringService();
