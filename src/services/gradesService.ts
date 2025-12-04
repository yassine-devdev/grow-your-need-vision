import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface GradeRecord extends RecordModel {
    student: string;
    class: string;
    exam?: string;
    assignment?: string;
    score: number;
    max_score: number;
    weight: number;
    type: 'Exam' | 'Assignment' | 'Project' | 'Participation';
    graded_by: string;
    graded_at: string;
    feedback?: string;
    expand?: {
        student?: RecordModel;
        class?: RecordModel;
        exam?: RecordModel;
        assignment?: RecordModel;
    }
}

export const gradesService = {
    /**
     * Get grades for a specific class
     */
    async getClassGrades(classId: string) {
        return await pb.collection('grades').getFullList<GradeRecord>({
            filter: `class = "${classId}"`,
            expand: 'student,exam,assignment',
            sort: '-created',
            requestKey: null
        });
    },

    /**
     * Get grades for a specific student
     */
    async getStudentGrades(studentId: string) {
        return await pb.collection('grades').getFullList<GradeRecord>({
            filter: `student = "${studentId}"`,
            expand: 'class,exam,assignment',
            sort: '-created',
            requestKey: null
        });
    },

    /**
     * Submit a grade for a student
     */
    async submitGrade(data: {
        student: string;
        class: string;
        exam?: string;
        assignment?: string;
        score: number;
        max_score: number;
        weight: number;
        type: 'Exam' | 'Assignment' | 'Project' | 'Participation';
        feedback?: string;
    }) {
        const user = pb.authStore.model;
        if (!user) throw new Error("User not authenticated");

        return await pb.collection('grades').create({
            ...data,
            graded_by: user.id,
            graded_at: new Date().toISOString()
        });
    },

    /**
     * Update an existing grade
     */
    async updateGrade(gradeId: string, data: Partial<GradeRecord>) {
        return await pb.collection('grades').update(gradeId, {
            ...data,
            graded_at: new Date().toISOString() // Update timestamp
        });
    },

    /**
     * Calculate average grade for a student in a class
     */
    async calculateStudentAverage(studentId: string, classId: string) {
        const grades = await pb.collection('grades').getFullList<GradeRecord>({
            filter: `student = "${studentId}" && class = "${classId}"`,
            requestKey: null
        });

        if (grades.length === 0) return 0;

        let totalWeightedScore = 0;
        let totalWeight = 0;

        grades.forEach(grade => {
            const normalizedScore = (grade.score / grade.max_score) * 100;
            totalWeightedScore += normalizedScore * grade.weight;
            totalWeight += grade.weight;
        });

        return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;
    }
};
