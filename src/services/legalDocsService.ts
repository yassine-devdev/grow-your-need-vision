import pb from '../lib/pocketbase';
import { auditLog } from './auditLogger';

export interface LegalDocument {
    id: string;
    title: string;
    type: 'terms' | 'privacy' | 'gdpr' | 'cookie' | 'acceptable_use';
    version: string;
    status: 'draft' | 'published' | 'archived';
    content: string;
    updated_by: string;
    created: string;
    updated: string;
}

class LegalDocumentsService {
    private collection = 'legal_documents';

    async getAll(): Promise<LegalDocument[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                sort: '-updated',
            });
            return records as unknown as LegalDocument[];
        } catch (error) {
            console.error('Failed to fetch legal documents:', error);
            throw new Error('Failed to load legal documents');
        }
    }

    async getById(id: string): Promise<LegalDocument> {
        try {
            const record = await pb.collection(this.collection).getOne(id);
            return record as unknown as LegalDocument;
        } catch (error) {
            console.error(`Failed to fetch legal document ${id}:`, error);
            throw new Error('Failed to load legal document');
        }
    }

    async create(data: Omit<LegalDocument, 'id' | 'created' | 'updated'>): Promise<LegalDocument> {
        try {
            const record = await pb.collection(this.collection).create(data);
            await auditLog.log('legal_doc.create', { document_id: record.id, title: data.title }, 'info');
            return record as unknown as LegalDocument;
        } catch (error) {
            console.error('Failed to create legal document:', error);
            throw new Error('Failed to create legal document');
        }
    }

    async update(id: string, data: Partial<LegalDocument>): Promise<LegalDocument> {
        try {
            const record = await pb.collection(this.collection).update(id, data);
            await auditLog.log('legal_doc.update', { document_id: id, changes: data }, 'info');
            return record as unknown as LegalDocument;
        } catch (error) {
            console.error(`Failed to update legal document ${id}:`, error);
            throw new Error('Failed to update legal document');
        }
    }

    async publish(id: string, newVersion: string): Promise<LegalDocument> {
        try {
            const record = await pb.collection(this.collection).update(id, {
                status: 'published',
                version: newVersion
            });
            await auditLog.log('legal_doc.publish', { document_id: id, version: newVersion }, 'warning');
            return record as unknown as LegalDocument;
        } catch (error) {
            console.error(`Failed to publish legal document ${id}:`, error);
            throw new Error('Failed to publish legal document');
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await pb.collection(this.collection).delete(id);
            await auditLog.log('legal_doc.delete', { document_id: id }, 'warning');
            return true;
        } catch (error) {
            console.error(`Failed to delete legal document ${id}:`, error);
            throw new Error('Failed to delete legal document');
        }
    }

    async getByType(type: LegalDocument['type']): Promise<LegalDocument[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                filter: `type = "${type}"`,
                sort: '-version',
            });
            return records as unknown as LegalDocument[];
        } catch (error) {
            console.error(`Failed to fetch ${type} documents:`, error);
            throw new Error('Failed to load documents');
        }
    }

    async getPublished(): Promise<LegalDocument[]> {
        try {
            const records = await pb.collection(this.collection).getFullList({
                filter: 'status = "published"',
                sort: '-updated',
            });
            return records as unknown as LegalDocument[];
        } catch (error) {
            console.error('Failed to fetch published documents:', error);
            throw new Error('Failed to load published documents');
        }
    }
}

export const legalDocsService = new LegalDocumentsService();
