import pb from '../lib/pocketbase';
import { auditLog } from './auditLogger';
import { isMockEnv } from '../utils/mockData';
import { RecordModel } from 'pocketbase';

export interface Backup extends RecordModel {
    id: string;
    type: 'full' | 'incremental' | 'manual';
    size_bytes: number;
    status: 'completed' | 'in_progress' | 'failed';
    file_path: string;
    retention_days: number;
    description?: string;
    collections_included?: string[];
    error_message?: string;
    completed_at?: string;
    created: string;
    updated: string;
}

export interface CreateBackupData {
    type: Backup['type'];
    description?: string;
    collections_included?: string[];
    retention_days?: number;
}

const MOCK_BACKUPS: Backup[] = [
    {
        id: 'backup-1',
        collectionId: 'mock',
        collectionName: 'backups',
        created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        type: 'full',
        size_bytes: 256000000,
        status: 'completed',
        file_path: '/backups/full_1702675200000.tar.gz',
        retention_days: 30,
        description: 'Daily full backup',
        completed_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'backup-2',
        collectionId: 'mock',
        collectionName: 'backups',
        created: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        type: 'incremental',
        size_bytes: 15000000,
        status: 'completed',
        file_path: '/backups/incremental_1702696800000.tar.gz',
        retention_days: 7,
        description: 'Hourly incremental',
        completed_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'backup-3',
        collectionId: 'mock',
        collectionName: 'backups',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        type: 'manual',
        size_bytes: 0,
        status: 'in_progress',
        file_path: '/backups/manual_1702718400000.tar.gz',
        retention_days: 90,
        description: 'Pre-deployment backup'
    }
];

class BackupService {
    private collection = 'backups';

    /**
     * Get all backups
     */
    async getAll(): Promise<Backup[]> {
        if (isMockEnv()) {
            return MOCK_BACKUPS;
        }

        try {
            const records = await pb.collection(this.collection).getFullList({
                sort: '-created',
                requestKey: null
            });
            return records as unknown as Backup[];
        } catch (error) {
            console.error('Failed to fetch backups:', error);
            return [];
        }
    }

    /**
     * Get backup by ID
     */
    async getById(id: string): Promise<Backup | null> {
        if (isMockEnv()) {
            return MOCK_BACKUPS.find(b => b.id === id) || null;
        }

        try {
            const record = await pb.collection(this.collection).getOne(id, {
                requestKey: null
            });
            return record as unknown as Backup;
        } catch (error) {
            console.error(`Failed to fetch backup ${id}:`, error);
            return null;
        }
    }

    /**
     * Create a backup record
     */
    async create(data: CreateBackupData): Promise<Backup | null> {
        const filePath = `/backups/${data.type}_${Date.now()}.tar.gz`;
        const retentionDays = data.retention_days ?? (data.type === 'full' ? 30 : data.type === 'incremental' ? 7 : 90);

        if (isMockEnv()) {
            const newBackup: Backup = {
                id: `backup-${Date.now()}`,
                collectionId: 'mock',
                collectionName: 'backups',
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                type: data.type,
                size_bytes: 0,
                status: 'in_progress',
                file_path: filePath,
                retention_days: retentionDays,
                description: data.description,
                collections_included: data.collections_included
            };
            MOCK_BACKUPS.unshift(newBackup);
            return newBackup;
        }

        try {
            const record = await pb.collection(this.collection).create({
                type: data.type,
                size_bytes: 0,
                status: 'in_progress',
                file_path: filePath,
                retention_days: retentionDays,
                description: data.description,
                collections_included: data.collections_included
            });
            await auditLog.log('backup.create', { backup_id: record.id, type: data.type }, 'info');
            return record as unknown as Backup;
        } catch (error) {
            console.error('Failed to create backup:', error);
            return null;
        }
    }

    /**
     * Delete a backup
     */
    async delete(id: string): Promise<boolean> {
        if (isMockEnv()) {
            const idx = MOCK_BACKUPS.findIndex(b => b.id === id);
            if (idx >= 0) {
                MOCK_BACKUPS.splice(idx, 1);
                return true;
            }
            return false;
        }

        try {
            await pb.collection(this.collection).delete(id);
            await auditLog.log('backup.delete', { backup_id: id }, 'warning');
            return true;
        } catch (error) {
            console.error(`Failed to delete backup ${id}:`, error);
            return false;
        }
    }

    /**
     * Initiate a new backup
     */
    async initiateBackup(type: Backup['type'] = 'manual', description?: string): Promise<Backup | null> {
        const backup = await this.create({ type, description });
        if (backup) {
            await auditLog.log('backup.initiate', { backup_id: backup.id, type }, 'warning');
            
            // Simulate backup process (in real implementation, this would be async)
            if (isMockEnv()) {
                setTimeout(() => this.completeBackup(backup.id, Math.floor(Math.random() * 500000000)), 2000);
            }
        }
        return backup;
    }

    /**
     * Mark backup as completed
     */
    async completeBackup(id: string, sizeBytes: number): Promise<Backup | null> {
        if (isMockEnv()) {
            const idx = MOCK_BACKUPS.findIndex(b => b.id === id);
            if (idx >= 0) {
                MOCK_BACKUPS[idx] = {
                    ...MOCK_BACKUPS[idx],
                    status: 'completed',
                    size_bytes: sizeBytes,
                    completed_at: new Date().toISOString(),
                    updated: new Date().toISOString()
                };
                return MOCK_BACKUPS[idx];
            }
            return null;
        }

        try {
            const record = await pb.collection(this.collection).update(id, {
                status: 'completed',
                size_bytes: sizeBytes,
                completed_at: new Date().toISOString()
            });
            return record as unknown as Backup;
        } catch (error) {
            console.error(`Failed to complete backup ${id}:`, error);
            return null;
        }
    }

    /**
     * Mark backup as failed
     */
    async failBackup(id: string, errorMessage: string): Promise<Backup | null> {
        if (isMockEnv()) {
            const idx = MOCK_BACKUPS.findIndex(b => b.id === id);
            if (idx >= 0) {
                MOCK_BACKUPS[idx] = {
                    ...MOCK_BACKUPS[idx],
                    status: 'failed',
                    error_message: errorMessage,
                    updated: new Date().toISOString()
                };
                return MOCK_BACKUPS[idx];
            }
            return null;
        }

        try {
            const record = await pb.collection(this.collection).update(id, {
                status: 'failed',
                error_message: errorMessage
            });
            await auditLog.log('backup.failed', { backup_id: id, error: errorMessage }, 'critical');
            return record as unknown as Backup;
        } catch (error) {
            console.error(`Failed to mark backup ${id} as failed:`, error);
            return null;
        }
    }

    /**
     * Restore from a backup
     */
    async restore(id: string): Promise<{ success: boolean; message: string }> {
        const backup = await this.getById(id);
        if (!backup) {
            return { success: false, message: 'Backup not found' };
        }

        if (backup.status !== 'completed') {
            return { success: false, message: 'Can only restore from completed backups' };
        }

        await auditLog.log('backup.restore', { backup_id: id, file_path: backup.file_path }, 'critical');

        // In a real implementation, this would:
        // 1. Stop the application
        // 2. Extract the backup archive
        // 3. Restore the database
        // 4. Restart the application
        console.log('Restoring from backup:', backup.file_path);

        return { success: true, message: `Restore initiated from ${backup.file_path}` };
    }

    /**
     * Download a backup
     */
    async download(id: string): Promise<{ url: string } | null> {
        const backup = await this.getById(id);
        if (!backup || backup.status !== 'completed') {
            return null;
        }

        await auditLog.log('backup.download', { backup_id: id }, 'info');

        // In a real implementation, generate a signed URL
        return { url: backup.file_path };
    }

    /**
     * Get backups by status
     */
    async getByStatus(status: Backup['status']): Promise<Backup[]> {
        if (isMockEnv()) {
            return MOCK_BACKUPS.filter(b => b.status === status);
        }

        try {
            const records = await pb.collection(this.collection).getFullList({
                filter: `status = "${status}"`,
                sort: '-created',
                requestKey: null
            });
            return records as unknown as Backup[];
        } catch (error) {
            console.error(`Failed to fetch ${status} backups:`, error);
            return [];
        }
    }

    /**
     * Get backup statistics
     */
    async getStatistics(): Promise<{
        total: number;
        completed: number;
        failed: number;
        inProgress: number;
        totalSize: number;
        lastBackup?: string;
    }> {
        const backups = await this.getAll();
        const completed = backups.filter(b => b.status === 'completed');
        
        return {
            total: backups.length,
            completed: completed.length,
            failed: backups.filter(b => b.status === 'failed').length,
            inProgress: backups.filter(b => b.status === 'in_progress').length,
            totalSize: completed.reduce((sum, b) => sum + b.size_bytes, 0),
            lastBackup: completed.length > 0 ? completed[0].completed_at : undefined
        };
    }

    /**
     * Clean up old backups based on retention policy
     */
    async cleanupExpired(): Promise<number> {
        const backups = await this.getAll();
        const now = new Date();
        let deletedCount = 0;

        for (const backup of backups) {
            if (backup.status !== 'completed') continue;
            
            const createdDate = new Date(backup.created);
            const expiryDate = new Date(createdDate.getTime() + backup.retention_days * 24 * 60 * 60 * 1000);
            
            if (now > expiryDate) {
                const deleted = await this.delete(backup.id);
                if (deleted) deletedCount++;
            }
        }

        if (deletedCount > 0) {
            await auditLog.log('backup.cleanup', { deleted_count: deletedCount }, 'info');
        }

        return deletedCount;
    }

    /**
     * Format size for display
     */
    formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

export const backupService = new BackupService();
