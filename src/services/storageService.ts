import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize MinIO client (S3 compatible)
const s3Client = new S3Client({
    endpoint: import.meta.env.VITE_MINIO_ENDPOINT || 'http://localhost:9090',
    region: 'us-east-1', // MinIO ignores region but SDK requires it
    credentials: {
        accessKeyId: import.meta.env.VITE_MINIO_ACCESS_KEY || 'admin',
        secretAccessKey: import.meta.env.VITE_MINIO_SECRET_KEY || 'password123',
    },
    forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = import.meta.env.VITE_STORAGE_BUCKET || 'growyourneed-files';

export const storageService = {
    /**
     * Upload file to MinIO storage
     */
    async uploadFile(file: File, path: string) {
        try {
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: path,
                Body: file,
                ContentType: file.type,
            });

            await s3Client.send(command);

            // Return the public URL (assuming bucket is public or using presigned URLs for access)
            const endpoint = import.meta.env.VITE_MINIO_ENDPOINT || 'http://localhost:9090';
            return {
                url: `${endpoint}/${BUCKET_NAME}/${path}`,
                key: path,
            };
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    },

    /**
     * Get a temporary signed URL for viewing/downloading a file
     */
    async getSignedUrl(key: string, expiresIn: number = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });

            return await getSignedUrl(s3Client, command, { expiresIn });
        } catch (error) {
            console.error("Error generating signed URL:", error);
            throw error;
        }
    },

    /**
     * Delete a file from storage
     */
    async deleteFile(key: string) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });

            await s3Client.send(command);
        } catch (error) {
            console.error("Error deleting file:", error);
            throw error;
        }
    }
};
