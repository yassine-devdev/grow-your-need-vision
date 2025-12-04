import pb from '../lib/pocketbase';
import { SchoolClass, Subject, Exam, ExamResult, Enrollment } from '../apps/school/types';

export const academicsService = {
    // --- Classes ---
    async getClasses() {
        return await pb.collection('school_classes').getFullList<SchoolClass>({ sort: '-created', expand: 'teacher' });
    },
    async getTeacherClasses(teacherId: string) {
        return await pb.collection('school_classes').getFullList<SchoolClass>({
            filter: `teacher = "${teacherId}"`,
            sort: '-created',
            expand: 'teacher'
        });
    },
    async getStudentClasses(studentId: string) {
        const enrollments = await pb.collection('enrollments').getFullList<Enrollment>({
            filter: `student = "${studentId}"`,
            expand: 'class,class.teacher'
        });
        return enrollments.map(e => e.expand?.class as SchoolClass).filter(Boolean);
    },
    async createClass(data: Partial<SchoolClass>) {
        return await pb.collection('school_classes').create(data);
    },
    async updateClass(id: string, data: Partial<SchoolClass>) {
        return await pb.collection('school_classes').update(id, data);
    },
    async deleteClass(id: string) {
        return await pb.collection('school_classes').delete(id);
    },

    // --- Subjects ---
    async getSubjects() {
        return await pb.collection('subjects').getFullList<Subject>({ sort: 'name' });
    },
    async createSubject(data: Partial<Subject>) {
        return await pb.collection('subjects').create(data);
    },
    async updateSubject(id: string, data: Partial<Subject>) {
        return await pb.collection('subjects').update(id, data);
    },
    async deleteSubject(id: string) {
        return await pb.collection('subjects').delete(id);
    },

    // --- Exams ---
    async getExams() {
        return await pb.collection('exams').getFullList<Exam>({ sort: '-date', expand: 'subject,class' });
    },
    async createExam(data: Partial<Exam>) {
        return await pb.collection('exams').create(data);
    },
    async updateExam(id: string, data: Partial<Exam>) {
        return await pb.collection('exams').update(id, data);
    },
    async deleteExam(id: string) {
        return await pb.collection('exams').delete(id);
    },

    // --- Grades ---
    async getStudentGrades(studentId: string) {
        return await pb.collection('exam_results').getFullList<ExamResult>({
            filter: `student = "${studentId}"`,
            expand: 'exam,exam.subject'
        });
    },

    async getClassExams(classId: string) {
        return await pb.collection('exams').getFullList<Exam>({
            filter: `class = "${classId}"`,
            sort: 'date'
        });
    },

    async getClassGrades(classId: string) {
        // We need to fetch all results for exams in this class
        // Since we can't easily filter exam_results by exam.class, we might need to fetch exams first
        // Or we can rely on the fact that we will fetch exams for the columns, and then fetch results for those exams.
        // A better way is to fetch all results where exam.class = classId if PocketBase supports deep filtering (it does partially).
        // But safer is to fetch by exam IDs.
        // For now, let's just fetch all results and filter in memory if the dataset is small, 
        // OR fetch results for specific exams.
        
        // Let's try fetching all results for the class's exams.
        // 1. Get exams
        const exams = await this.getClassExams(classId);
        if (exams.length === 0) return [];
        
        const examIds = exams.map(e => `exam = "${e.id}"`).join(' || ');
        return await pb.collection('exam_results').getFullList<ExamResult>({
            filter: examIds,
            expand: 'student,exam'
        });
    },

    async updateGrade(resultId: string, marks: number) {
        return await pb.collection('exam_results').update(resultId, { marks_obtained: marks });
    },

    async createGrade(data: Partial<ExamResult>) {
        return await pb.collection('exam_results').create(data);
    },

    // --- Stats ---
    async getStats() {
        try {
            const students = await pb.collection('users').getList(1, 1, { filter: 'role = "Student"' });
            const teachers = await pb.collection('users').getList(1, 1, { filter: 'role = "Teacher"' });
            return {
                totalStudents: students.totalItems,
                totalTeachers: teachers.totalItems
            };
        } catch (e) {
            console.error("Error fetching stats:", e);
            return { totalStudents: 0, totalTeachers: 0 };
        }
    }
};
