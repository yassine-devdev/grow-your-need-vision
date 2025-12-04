import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';
import { notificationService } from './notificationService';

export interface AssignmentRecord extends RecordModel {
    title: string;
    description: string;
    due_date: string;
    class_id: string;
    teacher_id: string;
    points?: number;
    attachments?: string[];
    expand?: {
        class_id?: RecordModel;
        teacher_id?: RecordModel;
    }
}

export interface SubmissionRecord extends RecordModel {
    assignment_id: string;
    student_id: string;
    submitted_at: string;
    files?: string[];
    grade?: number;
    feedback?: string;
    graded_by?: string;
    graded_at?: string;
    notes?: string;
    expand?: {
        student_id?: RecordModel;
        assignment_id?: RecordModel;
    }
}

export const assignmentService = {
    /**
     * Get assignments for a teacher
     */
    async getAssignments(teacherId: string, page = 1, perPage = 50) {
        return await pb.collection('assignments').getList<AssignmentRecord>(page, perPage, {
            filter: `teacher_id = "${teacherId}"`,
            sort: '-due_date',
            expand: 'class_id',
            requestKey: null
        });
    },

    /**
     * Get all assignments (Admin view)
     */
    async getAllAssignments(page = 1, perPage = 50) {
        return await pb.collection('assignments').getList<AssignmentRecord>(page, perPage, {
            sort: '-due_date',
            expand: 'class_id,teacher_id',
            requestKey: null
        });
    },

    /**
     * Get assignments for a class
     */
    async getAssignmentsByClass(classId: string, page = 1, perPage = 50) {
        return await pb.collection('assignments').getList<AssignmentRecord>(page, perPage, {
            filter: `class_id = "${classId}"`,
            sort: '-due_date',
            expand: 'teacher_id',
            requestKey: null
        });
    },

    /**
     * Get single assignment
     */
    async getAssignment(id: string) {
        return await pb.collection('assignments').getOne<AssignmentRecord>(id, {
            expand: 'class_id,teacher_id',
            requestKey: null
        });
    },

    /**
     * Create assignment
     */
    async createAssignment(data: {
        title: string;
        description: string;
        due_date: string;
        class_id: string;
        teacher_id: string;
        points?: number;
        attachments?: string[];
    }) {
        const assignment = await pb.collection('assignments').create<AssignmentRecord>(data);

        // Notify students in the class
        try {
            // Assuming 'enrollments' collection has 'class' and 'student' fields
            const enrollments = await pb.collection('enrollments').getFullList({
                filter: `class = "${data.class_id}"`,
                expand: 'student',
                requestKey: null
            });

            const studentIds = enrollments.map((e: any) => e.student);

            if (studentIds.length > 0) {
                await notificationService.notifyNewAssignment(
                    studentIds,
                    data.title,
                    data.due_date
                );
            }
        } catch (error) {
            console.error('Failed to notify students:', error);
        }

        return assignment;
    },

    /**
     * Update assignment
     */
    async updateAssignment(id: string, data: Partial<{
        title: string;
        description: string;
        due_date: string;
        class_id: string;
        teacher_id: string;
        points?: number;
        attachments?: string[];
    }>) {
        return await pb.collection('assignments').update<AssignmentRecord>(id, data);
    },

    /**
     * Delete assignment
     */
    async deleteAssignment(id: string) {
        return await pb.collection('assignments').delete(id);
    },

    /**
     * Get submissions for an assignment
     */
    async getSubmissions(assignmentId: string) {
        return await pb.collection('submissions').getFullList<SubmissionRecord>({
            filter: `assignment_id = "${assignmentId}"`,
            expand: 'student_id',
            sort: '-submitted_at',
            requestKey: null
        });
    },

    /**
     * Grade a submission
     */
    async gradeSubmission(submissionId: string, grade: number, feedback: string, gradedBy: string) {
        const submission = await pb.collection('submissions').update<SubmissionRecord>(submissionId, {
            grade,
            feedback,
            graded_by: gradedBy,
            graded_at: new Date().toISOString()
        });

        // Notify student
        try {
            const submissionData = await pb.collection('submissions').getOne(submissionId, {
                expand: 'assignment_id,student_id'
            });

            await notificationService.notifyGradePosted(
                submissionData.student_id,
                submissionData.expand?.assignment_id?.title || 'Assignment',
                grade
            );
        } catch (error) {
            console.error('Failed to notify student:', error);
        }

        return submission;
    },

    /**
     * Get assignments for a student
     */
    async getStudentAssignments(studentId: string) {
        // Get student's enrollments
        const enrollments = await pb.collection('enrollments').getFullList({
            filter: `student = "${studentId}"`,
            requestKey: null
        });

        const classIds = enrollments.map((e: any) => e.class);

        if (classIds.length === 0) {
            return [];
        }

        // Get assignments for those classes
        const filter = classIds.map(id => `class_id = "${id}"`).join(' || ');

        return await pb.collection('assignments').getFullList<AssignmentRecord>({
            filter,
            sort: '-due_date',
            expand: 'class_id,teacher_id',
            requestKey: null
        });
    },

    /**
     * Submit assignment
     */
    async submitAssignment(assignmentId: string, studentId: string, notes?: string) {
        const submission = await pb.collection('submissions').create<SubmissionRecord>({
            assignment_id: assignmentId,
            student_id: studentId,
            submitted_at: new Date().toISOString(),
            notes: notes || ''
        });

        // Notify teacher
        try {
            const assignment = await this.getAssignment(assignmentId);
            const student = await pb.collection('users').getOne(studentId);

            await notificationService.notifyNewSubmission(
                assignment.teacher_id,
                student.name,
                assignment.title
            );
        } catch (error) {
            console.error('Failed to notify teacher:', error);
        }

        return submission;
    },

    /**
     * Get student's submission for an assignment (returns the latest one)
     */
    async getStudentSubmission(assignmentId: string, studentId: string) {
        try {
            return await pb.collection('submissions').getFirstListItem<SubmissionRecord>(
                `assignment_id = "${assignmentId}" && student_id = "${studentId}"`,
                {
                    sort: '-submitted_at',
                    expand: 'assignment_id',
                    requestKey: null
                }
            );
        } catch (error) {
            // If not found, return null
            return null;
        }
    },

    /**
     * Get student's submission history for an assignment
     */
    async getSubmissionHistory(assignmentId: string, studentId: string) {
        return await pb.collection('submissions').getFullList<SubmissionRecord>({
            filter: `assignment_id = "${assignmentId}" && student_id = "${studentId}"`,
            sort: '-submitted_at',
            expand: 'assignment_id',
            requestKey: null
        });
    }
};
