/**
 * CRM Email Integration Service
 * Send emails from CRM with templates and tracking
 */

import pb from '../lib/pocketbase';
import { auditLogger } from './auditLogger';

export interface Email {
    id: string;
    contact_id: string;
    deal_id?: string;
    subject: string;
    body: string;
    template_id?: string;
    status: 'draft' | 'sent' | 'delivered' | 'opened' | 'clicked';
    sent_at?: string;
    opened_at?: string;
    tracking_enabled: boolean;
    created: string;
    updated: string;
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject_template: string;
    body_template: string;
    variables: string[];
    category: string;
    created: string;
    updated: string;
}

class CRMEmailService {
    private emailCollection = 'crm_emails';
    private templateCollection = 'email_templates';

    async sendEmail(to: string, subject: string, body: string, options?: {
        contactId?: string;
        dealId?: string;
        trackingEnabled?: boolean;
    }): Promise<Email> {
        try {
            const email = await pb.collection(this.emailCollection).create<Email>({
                contact_id: options?.contactId,
                deal_id: options?.dealId,
                subject,
                body,
                status: 'sent',
                sent_at: new Date().toISOString(),
                tracking_enabled: options?.trackingEnabled || false
            });

            // In production, integrate with SMTP service here
            await auditLogger.log('emailSent', {
                email_id: email.id,
                to,
                subject
            });

            return email;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async getEmailTemplates(): Promise<EmailTemplate[]> {
        try {
            return await pb.collection(this.templateCollection).getFullList<EmailTemplate>({
                sort: 'name'
            });
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    }

    async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
        try {
            const created = await pb.collection(this.templateCollection).create<EmailTemplate>(template);
            await auditLogger.log('emailTemplateCreate', { template_id: created.id, name: created.name });
            return created;
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    }

    parseTemplate(template: EmailTemplate, variables: Record<string, string>): { subject: string; body: string } {
        let subject = template.subject_template;
        let body = template.body_template;

        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            subject = subject.replace(new RegExp(placeholder, 'g'), value);
            body = body.replace(new RegExp(placeholder, 'g'), value);
        });

        return { subject, body };
    }

    async trackEmailOpen(emailId: string): Promise<Email> {
        try {
            return await pb.collection(this.emailCollection).update<Email>(emailId, {
                status: 'opened',
                opened_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error tracking email open:', error);
            throw error;
        }
    }

    async getEmailHistory(contactId: string): Promise<Email[]> {
        try {
            return await pb.collection(this.emailCollection).getFullList<Email>({
                filter: `contact_id="${contactId}"`,
                sort: '-sent_at'
            });
        } catch (error) {
            console.error('Error fetching email history:', error);
            throw error;
        }
    }

    async deleteDraft(id: string): Promise<boolean> {
        try {
            await pb.collection(this.emailCollection).delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting draft:', error);
            throw error;
        }
    }
}

export const crmEmailService = new CRMEmailService();
