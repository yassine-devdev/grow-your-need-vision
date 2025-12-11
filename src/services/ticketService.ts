import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface Ticket extends RecordModel {
    subject: string;
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    tenantId: string;
    created_by: string; // User ID
    assigned_to?: string; // User ID
    category: 'Technical' | 'Billing' | 'Feature Request' | 'Other';
}

export const ticketService = {
    async getTickets(filter?: string): Promise<Ticket[]> {
        return await pb.collection('tickets').getFullList<Ticket>({
            sort: '-created',
            filter: filter || '',
            expand: 'tenantId,created_by,assigned_to'
        });
    },

    async getTicketsByTenant(tenantId: string): Promise<Ticket[]> {
        return this.getTickets(`tenantId = "${tenantId}"`);
    },

    async createTicket(data: Partial<Ticket>): Promise<Ticket> {
        return await pb.collection('tickets').create<Ticket>(data);
    },

    async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
        return await pb.collection('tickets').update<Ticket>(id, data);
    },

    async deleteTicket(id: string): Promise<boolean> {
        return await pb.collection('tickets').delete(id);
    },

    async getStats(): Promise<{ open: number, critical: number, avgResponseTime: string }> {
        // In a real app, this might be a separate aggregation endpoint
        // For now, we'll fetch all and calculate
        const tickets = await this.getTickets();
        const open = tickets.filter(t => t.status === 'Open').length;
        const critical = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved').length;
        
        // Calculate average response time for resolved tickets
        const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
        let avgResponseTime = 'N/A';

        if (resolvedTickets.length > 0) {
            const totalTimeMs = resolvedTickets.reduce((acc, t) => {
                const created = new Date(t.created).getTime();
                const updated = new Date(t.updated).getTime();
                return acc + (updated - created);
            }, 0);
            
            const avgHours = totalTimeMs / resolvedTickets.length / (1000 * 60 * 60);
            avgResponseTime = `${avgHours.toFixed(1)}h`;
        }
        
        return {
            open,
            critical,
            avgResponseTime
        };
    }
};
