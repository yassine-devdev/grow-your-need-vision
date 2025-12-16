/**
 * CRM Deal Assignment Service
 * Assign deals to team members with role management
 */

import pb from '../lib/pocketbase';
import { auditLogger } from './auditLogger';

export interface DealAssignment {
    id: string;
    deal_id: string;
    assigned_to: string;
    assigned_by: string;
    role: 'owner' | 'collaborator' | 'viewer';
    assigned_at: string;
    notes?: string;
    created: string;
    updated: string;
}

class CRMAssignmentService {
    private collection = 'deal_assignments';

    async assignDeal(dealId: string, userId: string, role: 'owner' | 'collaborator' | 'viewer', assignedBy: string, notes?: string): Promise<DealAssignment> {
        try {
            const assignment = await pb.collection(this.collection).create<DealAssignment>({
                deal_id: dealId,
                assigned_to: userId,
                assigned_by: assignedBy,
                role,
                assigned_at: new Date().toISOString(),
                notes
            });

            await auditLogger.log({
                action: 'dealAssign',
                resource_type: 'deal_assignment',
                resource_id: assignment.id,
                severity: 'info',
                metadata: {
                    deal_id: dealId,
                    assigned_to: userId,
                    role
                }
            });

            return assignment;
        } catch (error) {
            console.error('Error assigning deal:', error);
            throw error;
        }
    }

    async reassignDeal(dealId: string, newUserId: string, assignedBy: string): Promise<DealAssignment> {
        try {
            // Get current owner assignment
            const currentAssignments = await pb.collection(this.collection).getFullList<DealAssignment>({
                filter: `deal_id="${dealId}" && role="owner"`
            });

            // Remove current owner
            for (const assignment of currentAssignments) {
                await pb.collection(this.collection).delete(assignment.id);
            }

            // Assign new owner
            return await this.assignDeal(dealId, newUserId, 'owner', assignedBy);
        } catch (error) {
            console.error('Error reassigning deal:', error);
            throw error;
        }
    }

    async getAssignedDeals(userId: string): Promise<DealAssignment[]> {
        try {
            return await pb.collection(this.collection).getFullList<DealAssignment>({
                filter: `assigned_to="${userId}"`,
                sort: '-assigned_at',
                expand: 'deal_id'
            });
        } catch (error) {
            console.error('Error fetching assigned deals:', error);
            throw error;
        }
    }

    async getDealTeam(dealId: string): Promise<DealAssignment[]> {
        try {
            return await pb.collection(this.collection).getFullList<DealAssignment>({
                filter: `deal_id="${dealId}"`,
                expand: 'assigned_to'
            });
        } catch (error) {
            console.error('Error fetching deal team:', error);
            throw error;
        }
    }

    async removeAssignment(assignmentId: string): Promise<boolean> {
        try {
            await pb.collection(this.collection).delete(assignmentId);
            await auditLogger.log({
                action: 'dealUnassign',
                resource_type: 'deal_assignment',
                resource_id: assignmentId,
                severity: 'info'
            });
            return true;
        } catch (error) {
            console.error('Error removing assignment:', error);
            throw error;
        }
    }

    async updateAssignmentRole(assignmentId: string, newRole: 'owner' | 'collaborator' | 'viewer'): Promise<DealAssignment> {
        try {
            const updated = await pb.collection(this.collection).update<DealAssignment>(assignmentId, {
                role: newRole
            });
            await auditLogger.log({
                action: 'dealRoleUpdate',
                resource_type: 'deal_assignment',
                resource_id: assignmentId,
                severity: 'info',
                metadata: { role: newRole }
            });
            return updated;
        } catch (error) {
            console.error('Error updating assignment role:', error);
            throw error;
        }
    }
}

export const crmAssignmentService = new CRMAssignmentService();
