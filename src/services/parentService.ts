import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface ParentStudentLink extends RecordModel {
    parent: string;
    student: string;
    relationship: string;
    expand?: {
        student?: RecordModel;
        parent?: RecordModel;
    }
}

export const parentService = {
    /**
     * Get all children linked to a parent
     */
    async getChildren(parentId: string) {
        try {
            const links = await pb.collection('parent_student_links').getFullList<ParentStudentLink>({
                filter: `parent = "${parentId}"`,
                expand: 'student',
                requestKey: null
            });
            
            // Return just the student records
            return links.map(link => ({
                ...link.expand?.student,
                linkId: link.id,
                relationship: link.relationship
            })).filter(child => child.id); // Filter out any where expansion failed
        } catch (error) {
            console.error('Failed to fetch children:', error);
            return [];
        }
    },

    /**
     * Link a student to a parent (usually done by admin, but maybe useful)
     */
    async linkChild(parentId: string, studentId: string, relationship: string = 'Parent') {
        return await pb.collection('parent_student_links').create({
            parent: parentId,
            student: studentId,
            relationship
        });
    }
};
