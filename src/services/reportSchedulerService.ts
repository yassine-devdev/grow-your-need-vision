import pb from '../lib/pocketbase';
import { auditLog } from './auditLogger';

export interface ScheduledReport {
    id: string;
    name: string;
    type: 'revenue' | 'usage' | 'tenants' | 'engagement';
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'csv' | 'excel';
    status: 'active' | 'paused';
    next_run: string;
    last_run?: string;
    created: string;
    updated: string;
}

class ReportSchedulerService {
    private collection = 'scheduled_reports';

    async getAll(): Promise<ScheduledReport[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                sort: 'next_run',
            });
            return records as unknown as ScheduledReport[];
        } catch (error) {
            console.error('Failed to fetch scheduled reports:', error);
            throw new Error('Failed to load scheduled reports');
        }
    }

    async getById(id: string): Promise<ScheduledReport> {
        try {
            const record = await pb.collection(this.collection).getOne(id);
            return record as unknown as ScheduledReport;
        } catch (error) {
            console.error(`Failed to fetch report ${id}:`, error);
            throw new Error('Failed to load report');
        }
    }

    async create(data: Omit<ScheduledReport, 'id' | 'created' | 'updated'>): Promise<ScheduledReport> {
        try {
            const record = await pb.collection(this.collection).create(data);
            await auditLog.log('report.schedule', { report_id: record.id, name: data.name, type: data.type }, 'info');
            return record as unknown as ScheduledReport;
        } catch (error) {
            console.error('Failed to create scheduled report:', error);
            throw new Error('Failed to create scheduled report');
        }
    }

    async update(id: string, data: Partial<ScheduledReport>): Promise<ScheduledReport> {
        try {
            const record = await pb.collection(this.collection).update(id, data);
            await auditLog.log('report.update', { report_id: id, changes: data }, 'info');
            return record as unknown as ScheduledReport;
        } catch (error) {
            console.error(`Failed to update report ${id}:`, error);
            throw new Error('Failed to update report');
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await pb.collection(this.collection).delete(id);
            await auditLog.log('report.delete', { report_id: id }, 'warning');
            return true;
        } catch (error) {
            console.error(`Failed to delete report ${id}:`, error);
            throw new Error('Failed to delete report');
        }
    }

    async runNow(id: string): Promise<boolean> {
        try {
            const report = await this.getById(id);
            // TODO: Implement actual report generation
            console.log('Generating report:', report.name);

            await pb.collection(this.collection).update(id, {
                last_run: new Date().toISOString()
            });

            await auditLog.log('report.run_manual', { report_id: id, name: report.name }, 'info');
            return true;
        } catch (error) {
            console.error(`Failed to run report ${id}:`, error);
            throw new Error('Failed to run report');
        }
    }

    async updateStatus(id: string, status: ScheduledReport['status']): Promise<ScheduledReport> {
        return this.update(id, { status });
    }

    async getActive(): Promise<ScheduledReport[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                filter: 'status = "active"',
                sort: 'next_run',
            });
            return records as unknown as ScheduledReport[];
        } catch (error) {
            console.error('Failed to fetch active reports:', error);
            throw new Error('Failed to load active reports');
        }
    }

    async getDueReports(): Promise<ScheduledReport[]> {
        try {
            const now = new Date().toISOString();
            const records = await pb.collection(this.collection).getFullList({
                filter: `status = "active" && next_run <= "${now}"`,
                sort: 'next_run',
            });
            return records as unknown as ScheduledReport[];
        } catch (error) {
            console.error('Failed to fetch due reports:', error);
            throw new Error('Failed to load due reports');
        }
    }
}

export const reportSchedulerService = new ReportSchedulerService();
