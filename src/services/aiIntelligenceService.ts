/**
 * AI Intelligence Service
 * Manages the 5-level intelligence framework for AI responses
 */

import pb from '../lib/pocketbase';

export interface IntelligenceFile {
    id: string;
    level: 1 | 2 | 3 | 4 | 5;
    file_name: string;
    file_path: string;
    file_size: number;
    status: 'uploaded' | 'processing' | 'ready' | 'error';
    token_count?: number;
    metadata?: {
        content_type?: string;
        pages?: number;
        language?: string;
        [key: string]: any;
    };
    error_message?: string;
    created: string;
    updated: string;
}

export interface IntelligenceLevelInfo {
    level: number;
    name: string;
    description: string;
    examples: string[];
}

export const INTELLIGENCE_LEVELS: IntelligenceLevelInfo[] = [
    {
        level: 1,
        name: 'Basic Knowledge Base',
        description: 'Company information, FAQs,general documentation',
        examples: ['company_info.pdf', 'faq_document.txt', 'about_us.md']
    },
    {
        level: 2,
        name: 'Product Documentation',
        description: 'User manuals, API docs, feature specifications',
        examples: ['user_manual.pdf', 'api_reference.md', 'feature_specs.docx']
    },
    {
        level: 3,
        name: 'Internal Knowledge',
        description: 'Internal processes, policies, team guidelines',
        examples: ['policies.pdf', 'workflows.md', 'guidelines.txt']
    },
    {
        level: 4,
        name: 'User Context',
        description: 'User preferences, history, personalization data',
        examples: ['user_profiles.json', 'preferences.csv', 'interaction_history.txt']
    },
    {
        level: 5,
        name: 'Real-time Data',
        description: 'Live data feeds, current metrics, dynamic content',
        examples: ['current_metrics.json', 'live_inventory.csv', 'realtime_stats.txt']
    }
];

class AIIntelligenceService {
    private collection = 'ai_intelligence_files';

    /**
     * Get all files for a specific intelligence level
     */
    async getFilesByLevel(level: 1 | 2 | 3 | 4 | 5): Promise<IntelligenceFile[]> {
        try {
            const files = await pb.collection(this.collection).getFullList<IntelligenceFile>({
                filter: `level = ${level}`,
                sort: '-created'
            });
            return files;
        } catch (error) {
            console.error(`Error fetching files for level ${level}:`, error);
            throw error;
        }
    }

    /**
     * Get all files across all levels
     */
    async getAllFiles(): Promise<IntelligenceFile[]> {
        try {
            const files = await pb.collection(this.collection).getFullList<IntelligenceFile>({
                sort: 'level,-created'
            });
            return files;
        } catch (error) {
            console.error('Error fetching all intelligence files:', error);
            throw error;
        }
    }

    /**
     * Upload a file to a specific intelligence level
     */
    async uploadFile(level: 1 | 2 | 3 | 4 | 5, file: File): Promise<IntelligenceFile> {
        try {
            const formData = new FormData();
            formData.append('level', level.toString());
            formData.append('file_name', file.name);
            formData.append('file_size', file.size.toString());
            formData.append('status', 'uploaded');
            formData.append('file', file);

            // TODO: Upload actual file to storage (S3/R2/local)
            const filePath = `/uploads/intelligence/level${level}/${Date.now()}_${file.name}`;
            formData.append('file_path', filePath);

            const newFile = await pb.collection(this.collection).create<IntelligenceFile>(formData);

            // TODO: Trigger async processing job
            await this.processFile(newFile.id);

            return newFile;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    /**
     * Process a file (extract text, calculate tokens, etc.)
     * This should be called asynchronously after upload
     */
    private async processFile(fileId: string): Promise<void> {
        try {
            // Update status to processing
            await pb.collection(this.collection).update(fileId, {
                status: 'processing'
            });

            // TODO: Implement actual file processing
            // 1. Extract text from file (PDF, DOCX, TXT, etc.)
            // 2. Chunk text into segments
            // 3. Calculate token count
            // 4. Store metadata
            // 5. Update status to 'ready'

            // Simulate processing delay
            setTimeout(async () => {
                try {
                    await pb.collection(this.collection).update(fileId, {
                        status: 'ready',
                        token_count: Math.floor(Math.random() * 5000) + 1000, // Mock token count
                        metadata: {
                            processed_at: new Date().toISOString(),
                            content_type: 'application/pdf'
                        }
                    });
                } catch (error) {
                    console.error('Error updating file status:', error);
                    await pb.collection(this.collection).update(fileId, {
                        status: 'error',
                        error_message: 'Processing failed'
                    });
                }
            }, 3000);
        } catch (error) {
            console.error('Error processing file:', error);
            await pb.collection(this.collection).update(fileId, {
                status: 'error',
                error_message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete a file
     */
    async deleteFile(fileId: string): Promise<boolean> {
        try {
            await pb.collection(this.collection).delete(fileId);
            // TODO: Delete actual file from storage
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * Reprocess a file (e.g., after error or to update)
     */
    async reprocessFile(fileId: string): Promise<void> {
        try {
            await this.processFile(fileId);
        } catch (error) {
            console.error('Error reprocessing file:', error);
            throw error;
        }
    }

    /**
     * Get statistics for a level
     */
    async getLevelStats(level: 1 | 2 | 3 | 4 | 5): Promise<{
        total: number;
        ready: number;
        processing: number;
        error: number;
        total_tokens: number;
    }> {
        try {
            const files = await this.getFilesByLevel(level);

            return {
                total: files.length,
                ready: files.filter(f => f.status === 'ready').length,
                processing: files.filter(f => f.status === 'processing').length,
                error: files.filter(f => f.status === 'error').length,
                total_tokens: files.reduce((sum, f) => sum + (f.token_count || 0), 0)
            };
        } catch (error) {
            console.error('Error getting level stats:', error);
            throw error;
        }
    }

    /**
     * Get overall statistics across all levels
     */
    async getOverallStats(): Promise<{
        levels: Record<number, { files: number; tokens: number }>;
        total_files: number;
        total_tokens: number;
    }> {
        try {
            const files = await this.getAllFiles();

            const levelStats: Record<number, { files: number; tokens: number }> = {};

            for (let i = 1; i <= 5; i++) {
                const levelFiles = files.filter(f => f.level === i);
                levelStats[i] = {
                    files: levelFiles.length,
                    tokens: levelFiles.reduce((sum, f) => sum + (f.token_count || 0), 0)
                };
            }

            return {
                levels: levelStats,
                total_files: files.length,
                total_tokens: files.reduce((sum, f) => sum + (f.token_count || 0), 0)
            };
        } catch (error) {
            console.error('Error getting overall stats:', error);
            throw error;
        }
    }
}

export const aiIntelligenceService = new AIIntelligenceService();
