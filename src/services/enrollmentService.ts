import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface EnrollmentRecord extends RecordModel {
    student: string;
    class: string;
    enrolled_at: string;
    // status: 'Active' | 'Completed' | 'Dropped' | 'Failed'; // Not in schema
    expand?: {
        student?: RecordModel;
        class?: RecordModel;
    }
}

export const enrollmentService = {
    /**
     * Enroll a student in a class
     */
    async enrollStudent(studentId: string, classId: string) {
        // Check if already enrolled
        const existing = await this.checkEnrollment(studentId, classId);
        if (existing) {
            throw new Error('Student is already enrolled in this class');
        }

        return await pb.collection('enrollments').create<EnrollmentRecord>({
            student: studentId,
            class: classId,
            enrolled_at: new Date().toISOString(),
            // status: 'Active'
        });
    },

    /**
     * Check if student is enrolled
     */
    async checkEnrollment(studentId: string, classId: string) {
        try {
            const result = await pb.collection('enrollments').getFirstListItem(
                `student = "${studentId}" && class = "${classId}"`
            );
            return result;
        } catch (e) {
            return null;
        }
    },

    /**
     * Get enrollments for a class
     */
    async getClassEnrollments(classId: string, page = 1, perPage = 50) {
        return await pb.collection('enrollments').getList<EnrollmentRecord>(page, perPage, {
            filter: `class = "${classId}"`,
            expand: 'student',
            sort: '-enrolled_at',
            requestKey: null
        });
    },

    /**
     * Get enrollments for a student
     */
    async getStudentEnrollments(studentId: string) {
        return await pb.collection('enrollments').getFullList<EnrollmentRecord>({
            filter: `student = "${studentId}"`,
            expand: 'class,class.teacher',
            sort: '-enrolled_at',
            requestKey: null
        });
    },

    /**
     * Update enrollment status
     */
    async updateStatus(enrollmentId: string, status: string) {
        // Schema doesn't support status, so we can't update it.
        // For "Dropped", we might want to delete the record.
        if (status === 'Dropped') {
            return await this.withdrawStudent(enrollmentId);
        }
        console.warn('Enrollment status update not supported by schema');
        return null;
    },

    /**
     * Withdraw student (delete enrollment)
     */
    async withdrawStudent(enrollmentId: string) {
        return await pb.collection('enrollments').delete(enrollmentId);
    }
};
