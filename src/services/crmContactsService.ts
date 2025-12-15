/**
 * CRM Contacts Service
 * Manage contacts with full CRUD operations, tags, custom fields, and activity tracking
 */

import pb from '../lib/pocketbase';
import { auditLogger } from './auditLogger';

export interface CRMContact {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
    title?: string;
    status: 'lead' | 'prospect' | 'customer' | 'inactive';
    tags?: string[];
    custom_fields?: Record<string, any>;
    last_contact?: string;
    created_by: string;
    created: string;
    updated: string;
}

export interface ContactFilters {
    status?: 'lead' | 'prospect' | 'customer' | 'inactive';
    company?: string;
    tags?: string[];
    search?: string;
}

class CRMContactsService {
    private collection = 'crm_contacts';

    /**
     * Get all contacts with optional filters
     */
    async getAllContacts(filters?: ContactFilters): Promise<CRMContact[]> {
        try {
            let filterString = '';
            const conditions: string[] = [];

            if (filters?.status) {
                conditions.push(`status = "${filters.status}"`);
            }

            if (filters?.company) {
                conditions.push(`company ~ "${filters.company}"`);
            }

            if (filters?.search) {
                conditions.push(`(first_name ~ "${filters.search}" || last_name ~ "${filters.search}" || email ~ "${filters.search}")`);
            }

            if (conditions.length > 0) {
                filterString = conditions.join(' && ');
            }

            const contacts = await pb.collection(this.collection).getFullList<CRMContact>({
                filter: filterString,
                sort: '-created'
            });

            return contacts;
        } catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    }

    /**
     * Get a contact by ID
     */
    async getContactById(id: string): Promise<CRMContact> {
        try {
            const contact = await pb.collection(this.collection).getOne<CRMContact>(id);
            return contact;
        } catch (error) {
            console.error('Error fetching contact:', error);
            throw error;
        }
    }

    /**
     * Create a new contact
     */
    async createContact(data: Partial<CRMContact>): Promise<CRMContact> {
        try {
            const contact = await pb.collection(this.collection).create<CRMContact>(data);

            await auditLogger.log('contactCreate', {
                contact_id: contact.id,
                name: `${contact.first_name} ${contact.last_name}`,
                email: contact.email
            });

            return contact;
        } catch (error) {
            console.error('Error creating contact:', error);
            throw error;
        }
    }

    /**
     * Update a contact
     */
    async updateContact(id: string, data: Partial<CRMContact>): Promise<CRMContact> {
        try {
            const contact = await pb.collection(this.collection).update<CRMContact>(id, data);

            await auditLogger.log('contactUpdate', {
                contact_id: id,
                changes: Object.keys(data)
            });

            return contact;
        } catch (error) {
            console.error('Error updating contact:', error);
            throw error;
        }
    }

    /**
     * Delete a contact
     */
    async deleteContact(id: string): Promise<boolean> {
        try {
            await pb.collection(this.collection).delete(id);

            await auditLogger.log('contactDelete', {
                contact_id: id
            });

            return true;
        } catch (error) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    }

    /**
     * Search contacts by query
     */
    async searchContacts(query: string): Promise<CRMContact[]> {
        try {
            const filter = `first_name ~ "${query}" || last_name ~ "${query}" || email ~ "${query}" || company ~ "${query}"`;

            const contacts = await pb.collection(this.collection).getFullList<CRMContact>({
                filter,
                sort: '-created'
            });

            return contacts;
        } catch (error) {
            console.error('Error searching contacts:', error);
            throw error;
        }
    }

    /**
     * Add tag to contact
     */
    async addTag(contactId: string, tag: string): Promise<CRMContact> {
        try {
            const contact = await this.getContactById(contactId);
            const tags = contact.tags || [];

            if (!tags.includes(tag)) {
                tags.push(tag);
                return this.updateContact(contactId, { tags });
            }

            return contact;
        } catch (error) {
            console.error('Error adding tag:', error);
            throw error;
        }
    }

    /**
     * Remove tag from contact
     */
    async removeTag(contactId: string, tag: string): Promise<CRMContact> {
        try {
            const contact = await this.getContactById(contactId);
            const tags = (contact.tags || []).filter(t => t !== tag);

            return this.updateContact(contactId, { tags });
        } catch (error) {
            console.error('Error removing tag:', error);
            throw error;
        }
    }

    /**
     * Update last contact date
     */
    async updateLastContact(contactId: string): Promise<CRMContact> {
        try {
            return this.updateContact(contactId, {
                last_contact: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating last contact:', error);
            throw error;
        }
    }

    /**
     * Get contacts by status
     */
    async getContactsByStatus(status: 'lead' | 'prospect' | 'customer' | 'inactive'): Promise<CRMContact[]> {
        return this.getAllContacts({ status });
    }

    /**
     * Get contact statistics
     */
    async getContactStats(): Promise<{
        total: number;
        by_status: Record<string, number>;
        recent: number;
    }> {
        try {
            const contacts = await this.getAllContacts();

            const by_status: Record<string, number> = {
                lead: 0,
                prospect: 0,
                customer: 0,
                inactive: 0
            };

            contacts.forEach(contact => {
                by_status[contact.status] = (by_status[contact.status] || 0) + 1;
            });

            // Count contacts from last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recent = contacts.filter(c => new Date(c.created) > thirtyDaysAgo).length;

            return {
                total: contacts.length,
                by_status,
                recent
            };
        } catch (error) {
            console.error('Error getting contact stats:', error);
            throw error;
        }
    }

    /**
     * Import contacts from CSV data
     */
    async importContacts(csvData: string): Promise<{ success: number; failed: number; errors: string[] }> {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',').map(v => v.trim());
            const contact: any = {};

            headers.forEach((header, idx) => {
                contact[header] = values[idx];
            });

            try {
                await this.createContact(contact);
                success++;
            } catch (error) {
                failed++;
                errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return { success, failed, errors };
    }

    /**
     * Export contacts to CSV
     */
    async exportContacts(filters?: ContactFilters): Promise<string> {
        try {
            const contacts = await this.getAllContacts(filters);

            const headers = ['first_name', 'last_name', 'email', 'phone', 'company', 'title', 'status'];
            const csvLines = [headers.join(',')];

            contacts.forEach(contact => {
                const values = headers.map(h => contact[h as keyof CRMContact] || '');
                csvLines.push(values.join(','));
            });

            return csvLines.join('\n');
        } catch (error) {
            console.error('Error exporting contacts:', error);
            throw error;
        }
    }
}

export const crmContactsService = new CRMContactsService();
