import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

/**
 * Universal File Upload Service
 * Handles file uploads to PocketBase for any collection
 */

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadResult {
    success: boolean;
    record?: RecordModel;
    error?: string;
}

class FileUploadService {
    /**
     * Upload a single file to a PocketBase record
     */
    async uploadFile(
        file: File,
        collection: string,
        recordId: string,
        fieldName: string
    ): Promise<UploadResult> {
        try {
            const formData = new FormData();
            formData.append(fieldName, file);

            const record = await pb.collection(collection).update(recordId, formData);

            return {
                success: true,
                record
            };
        } catch (error) {
            console.error('File upload failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }

    /**
     * Upload multiple files to a PocketBase record
     */
    async uploadFiles(
        files: File[],
        collection: string,
        recordId: string,
        fieldName: string
    ): Promise<UploadResult> {
        try {
            const formData = new FormData();
            files.forEach(file => formData.append(fieldName, file));

            const record = await pb.collection(collection).update(recordId, formData);

            return {
                success: true,
                record
            };
        } catch (error) {
            console.error('Multiple file upload failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }

    /**
     * Get file URL from PocketBase
     */
    getFileUrl(record: RecordModel, filename: string, thumb?: string): string {
        if (!record || !filename) return '';

        return pb.files.getUrl(record, filename, { thumb });
    }

    /**
     * Delete a file from a record
     */
    async deleteFile(
        collection: string,
        recordId: string,
        fieldName: string
    ): Promise<UploadResult> {
        try {
            const record = await pb.collection(collection).update(recordId, {
                [fieldName]: null
            });

            return {
                success: true,
                record
            };
        } catch (error) {
            console.error('File deletion failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Deletion failed'
            };
        }
    }

    /**
     * Validate file before upload
     */
    validateFile(
        file: File,
        options: {
            maxSize?: number; // in bytes
            allowedTypes?: string[]; // MIME types
            allowedExtensions?: string[];
        } = {}
    ): { valid: boolean; error?: string } {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = [],
            allowedExtensions = []
        } = options;

        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`
            };
        }

        // Check MIME type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `File type ${file.type} is not allowed`
            };
        }

        // Check file extension
        if (allowedExtensions.length > 0) {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (!extension || !allowedExtensions.includes(extension)) {
                return {
                    valid: false,
                    error: `File extension .${extension} is not allowed`
                };
            }
        }

        return { valid: true };
    }

    /**
     * Validate multiple files
     */
    validateFiles(
        files: File[],
        options: Parameters<typeof this.validateFile>[1] = {}
    ): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        files.forEach((file, index) => {
            const result = this.validateFile(file, options);
            if (!result.valid && result.error) {
                errors.push(`File ${index + 1} (${file.name}): ${result.error}`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

export const fileUploadService = new FileUploadService();
