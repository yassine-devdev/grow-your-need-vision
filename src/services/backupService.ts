import pb from '../lib/pocketbase';
import { auditLog } from './auditLogger';

export interface Backup {
    id: string;
    type: 'full' | 'incremental' | 'manual';
    size_bytes: number;
    status: 'completed' | 'in_progress' | 'failed';
    file_path: string;
    retention_days: number;
    created: string;
    updated: string;
}

class BackupService {
    private collection = 'backups';

    async getAll(): Promise<Backup[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                sort: '-created',
            });
            return records as unknown as Backup[];
        } catch (error) {
            console.error('Failed to fetch backups:', error);
            throw new Error('Failed to load backups');
        }
    }

    async getById(id: string): Promise<Backup> {
        try {
            const record = await pb.collection(this.collection).getOne(id);
            return record as unknown as Backup;
        } catch (error) {
            console.error(`Failed to fetch backup ${id}:`, error);
            throw new Error('Failed to load backup');
        }
    }

    async create(data: Omit<Backup, 'id' | 'created' | 'updated'>): Promise<Backup> {
        try {
            const record = await pb.collection(this.collection).create(data);
            await auditLog.log('backup.create', { backup_id: record.id, type: data.type }, 'info');
            return record as unknown as Backup;
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw new Error('Failed to create backup');
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await pb.collection(this.collection).delete(id);
            await auditLog.log('backup.delete', { backup_id: id }, 'warning');
            return true;
        } catch (error) {
            console.error(`Failed to delete backup ${id}:`, error);
            throw new Error('Failed to delete backup');
        }
    }

    async initiateBackup(type: Backup['type'] = 'manual'): Promise<Backup> {
        try {
            const backup = await this.create({
                type,
                size_bytes: 0,
                status: 'in_progress',
                file_path: `/backups/${type}_${Date.now()}.tar.gz`,
                retention_days: type === 'full' ? 30 : type === 'incremental' ? 7 : 90
            });

            await auditLog.log('backup.initiate', { backup_id: backup.id, type }, 'warning');
            return backup;
        } catch (error) {
            console.error('Failed to initiate backup:', error);
            throw new Error('Failed to initiate backup');
        }
    }

    async restore(id: string): Promise<boolean> {
        try {
            const backup = await this.getById(id);
            // TODO: Implement actual restore functionality
            console.log('Restoring from backup:', backup.file_path);
            await auditLog.log('backup.restore', { backup_id: id, file_path: backup.file_path }, 'critical');
            return true;
        } catch (error) {
            console.error(`Failed to restore backup ${id}:`, error);
            throw new Error('Failed to restore backup');
        }
    }

    async download(id: string): Promise<string> {
        try {
            const backup = await this.getById(id);
            // TODO: Implement actual download functionality
            console.log('Downloading backup:', backup.file_path);
            await auditLog.log('backup.download', { backup_id: id }, 'info');
            return backup.file_path;
        } catch (error) {
            console.error(`Failed to download backup ${id}:`, error);
            throw new Error('Failed to download backup');
        }
    }

    formatSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    async getStats(): Promise<{ total: number; total_size: number; last_backup?: string }> {
        try {
            const backups = await this.getAll();
            const completed = backups.filter(b => b.status === 'completed');
            return {
                total: completed.length,
                total_size: completed.reduce((sum, b) => sum + b.size_bytes, 0),
                last_backup: completed[0]?.created
            };
        } catch (error) {
            console.error('Failed to get backup stats:', error);
            return { total: 0, total_size: 0 };
        }
    }
}

export const backupService = new BackupService();
