/**
 * Student Service - Data layer for Student role functionality
 */

import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';
import { isMockEnv } from '../utils/mockData';

// ========================================
// INTERFACES
// ========================================

export interface Course extends RecordModel {
    student: string;
    name: string;
    code: string;
    teacher: string;
    teacher_name?: string;
    description?: string;
    schedule: { day: string; time: string; room: string }[];
    credits: number;
    grade?: number;
    status: 'active' | 'completed' | 'dropped';
    progress: number;
    color: string;
}

export interface Assignment extends RecordModel {
    student: string;
    course_id: string;
    course_name?: string;
    title: string;
    description?: string;
    type: 'homework' | 'quiz' | 'exam' | 'project' | 'essay' | 'lab';
    due_date: string;
    due_time?: string;
    status: 'pending' | 'submitted' | 'graded' | 'late' | 'missed';
    grade?: number;
    max_grade: number;
    submission_date?: string;
    feedback?: string;
    attachments?: string[];
    priority: 'low' | 'medium' | 'high';
}

export interface Grade extends RecordModel {
    student: string;
    course_id: string;
    course_name: string;
    assignment_id?: string;
    assignment_name?: string;
    type: 'assignment' | 'quiz' | 'exam' | 'participation' | 'project' | 'final';
    score: number;
    max_score: number;
    percentage: number;
    letter_grade?: string;
    weight: number;
    date: string;
    comments?: string;
}

export interface ScheduleItem extends RecordModel {
    student: string;
    course_id?: string;
    title: string;
    type: 'class' | 'exam' | 'study' | 'activity' | 'break' | 'event';
    day: number; // 0-6 (Sun-Sat)
    start_time: string;
    end_time: string;
    room?: string;
    teacher?: string;
    color: string;
    recurring: boolean;
    notes?: string;
}

export interface StudySession extends RecordModel {
    student: string;
    course_id?: string;
    subject?: string;
    duration: number; // minutes
    type: 'pomodoro' | 'free' | 'flashcards' | 'reading' | 'practice';
    date: string;
    notes?: string;
    completed: boolean;
}

export interface Flashcard extends RecordModel {
    student: string;
    deck_id: string;
    front: string;
    back: string;
    difficulty: 'easy' | 'medium' | 'hard';
    last_reviewed?: string;
    review_count: number;
    correct_count: number;
    next_review?: string;
}

export interface FlashcardDeck extends RecordModel {
    student: string;
    name: string;
    subject?: string;
    description?: string;
    card_count: number;
    mastery: number;
    color: string;
    is_public: boolean;
}

export interface StudentNote extends RecordModel {
    student: string;
    course_id?: string;
    title: string;
    content: string;
    tags: string[];
    is_favorite: boolean;
    color?: string;
}

export interface AttendanceRecord extends RecordModel {
    student: string;
    course_id: string;
    course_name: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
}

export interface Announcement extends RecordModel {
    title: string;
    content: string;
    type: 'general' | 'course' | 'urgent' | 'event';
    course_id?: string;
    author: string;
    date: string;
    is_read: boolean;
}

// ========================================
// MOCK DATA
// ========================================

const MOCK_COURSES: Course[] = [
    { id: 'c1', student: 'student-1', name: 'Mathematics', code: 'MATH-101', teacher: 't1', teacher_name: 'Dr. Johnson', description: 'Advanced Algebra and Calculus', schedule: [{ day: 'Mon', time: '09:00', room: 'A101' }, { day: 'Wed', time: '09:00', room: 'A101' }], credits: 4, grade: 92, status: 'active', progress: 75, color: '#3b82f6', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'c2', student: 'student-1', name: 'Physics', code: 'PHY-101', teacher: 't2', teacher_name: 'Prof. Smith', description: 'Mechanics and Thermodynamics', schedule: [{ day: 'Tue', time: '10:30', room: 'B202' }, { day: 'Thu', time: '10:30', room: 'B202' }], credits: 4, grade: 88, status: 'active', progress: 68, color: '#8b5cf6', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'c3', student: 'student-1', name: 'English Literature', code: 'ENG-201', teacher: 't3', teacher_name: 'Ms. Davis', description: 'Modern American Literature', schedule: [{ day: 'Mon', time: '14:00', room: 'C303' }, { day: 'Fri', time: '14:00', room: 'C303' }], credits: 3, grade: 95, status: 'active', progress: 82, color: '#22c55e', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'c4', student: 'student-1', name: 'Computer Science', code: 'CS-101', teacher: 't4', teacher_name: 'Dr. Chen', description: 'Introduction to Programming', schedule: [{ day: 'Wed', time: '13:00', room: 'Lab-1' }, { day: 'Fri', time: '13:00', room: 'Lab-1' }], credits: 3, grade: 98, status: 'active', progress: 90, color: '#f59e0b', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'c5', student: 'student-1', name: 'History', code: 'HIS-101', teacher: 't5', teacher_name: 'Prof. Williams', description: 'World History: Modern Era', schedule: [{ day: 'Tue', time: '14:00', room: 'D404' }], credits: 3, status: 'active', progress: 55, color: '#ec4899', collectionId: '', collectionName: '', created: '', updated: '' },
];

const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

const MOCK_ASSIGNMENTS: Assignment[] = [
    { id: 'a1', student: 'student-1', course_id: 'c1', course_name: 'Mathematics', title: 'Calculus Problem Set 5', description: 'Complete problems 1-20 from Chapter 5', type: 'homework', due_date: tomorrow.toISOString().split('T')[0], due_time: '23:59', status: 'pending', max_grade: 100, priority: 'high', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'a2', student: 'student-1', course_id: 'c2', course_name: 'Physics', title: 'Lab Report: Pendulum Motion', description: 'Write up the lab report with data analysis', type: 'lab', due_date: nextWeek.toISOString().split('T')[0], due_time: '17:00', status: 'pending', max_grade: 50, priority: 'medium', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'a3', student: 'student-1', course_id: 'c3', course_name: 'English Literature', title: 'Essay: The Great Gatsby Analysis', description: '1500 words on symbolism in The Great Gatsby', type: 'essay', due_date: nextWeek.toISOString().split('T')[0], status: 'pending', max_grade: 100, priority: 'high', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'a4', student: 'student-1', course_id: 'c4', course_name: 'Computer Science', title: 'Programming Project: Calculator', description: 'Build a calculator app with basic operations', type: 'project', due_date: new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0], status: 'pending', max_grade: 100, priority: 'medium', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'a5', student: 'student-1', course_id: 'c1', course_name: 'Mathematics', title: 'Chapter 4 Quiz', type: 'quiz', due_date: today.toISOString().split('T')[0], status: 'submitted', grade: 45, max_grade: 50, submission_date: today.toISOString(), priority: 'high', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'a6', student: 'student-1', course_id: 'c5', course_name: 'History', title: 'WWI Timeline Project', type: 'project', due_date: new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0], status: 'graded', grade: 92, max_grade: 100, submission_date: new Date(today.getTime() - 4 * 86400000).toISOString(), feedback: 'Excellent work! Very detailed timeline.', priority: 'medium', collectionId: '', collectionName: '', created: '', updated: '' },
];

const MOCK_GRADES: Grade[] = [
    { id: 'g1', student: 'student-1', course_id: 'c1', course_name: 'Mathematics', assignment_name: 'Midterm Exam', type: 'exam', score: 88, max_score: 100, percentage: 88, letter_grade: 'B+', weight: 25, date: new Date(today.getTime() - 30 * 86400000).toISOString().split('T')[0], collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'g2', student: 'student-1', course_id: 'c1', course_name: 'Mathematics', assignment_name: 'Homework Avg', type: 'assignment', score: 95, max_score: 100, percentage: 95, letter_grade: 'A', weight: 20, date: today.toISOString().split('T')[0], collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'g3', student: 'student-1', course_id: 'c2', course_name: 'Physics', assignment_name: 'Lab Reports', type: 'assignment', score: 42, max_score: 50, percentage: 84, letter_grade: 'B', weight: 30, date: today.toISOString().split('T')[0], collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'g4', student: 'student-1', course_id: 'c3', course_name: 'English Literature', assignment_name: 'Essay 1', type: 'assignment', score: 95, max_score: 100, percentage: 95, letter_grade: 'A', weight: 15, date: new Date(today.getTime() - 14 * 86400000).toISOString().split('T')[0], collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'g5', student: 'student-1', course_id: 'c4', course_name: 'Computer Science', assignment_name: 'Project 1', type: 'project', score: 100, max_score: 100, percentage: 100, letter_grade: 'A+', weight: 20, date: new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0], comments: 'Outstanding work!', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'g6', student: 'student-1', course_id: 'c4', course_name: 'Computer Science', assignment_name: 'Quiz 1', type: 'quiz', score: 48, max_score: 50, percentage: 96, letter_grade: 'A', weight: 10, date: new Date(today.getTime() - 21 * 86400000).toISOString().split('T')[0], collectionId: '', collectionName: '', created: '', updated: '' },
];

const MOCK_SCHEDULE: ScheduleItem[] = [
    { id: 's1', student: 'student-1', course_id: 'c1', title: 'Mathematics', type: 'class', day: 1, start_time: '09:00', end_time: '10:30', room: 'A101', teacher: 'Dr. Johnson', color: '#3b82f6', recurring: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 's2', student: 'student-1', course_id: 'c2', title: 'Physics', type: 'class', day: 2, start_time: '10:30', end_time: '12:00', room: 'B202', teacher: 'Prof. Smith', color: '#8b5cf6', recurring: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 's3', student: 'student-1', course_id: 'c1', title: 'Mathematics', type: 'class', day: 3, start_time: '09:00', end_time: '10:30', room: 'A101', teacher: 'Dr. Johnson', color: '#3b82f6', recurring: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 's4', student: 'student-1', course_id: 'c4', title: 'Computer Science', type: 'class', day: 3, start_time: '13:00', end_time: '14:30', room: 'Lab-1', teacher: 'Dr. Chen', color: '#f59e0b', recurring: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 's5', student: 'student-1', course_id: 'c2', title: 'Physics', type: 'class', day: 4, start_time: '10:30', end_time: '12:00', room: 'B202', teacher: 'Prof. Smith', color: '#8b5cf6', recurring: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 's6', student: 'student-1', course_id: 'c5', title: 'History', type: 'class', day: 2, start_time: '14:00', end_time: '15:30', room: 'D404', teacher: 'Prof. Williams', color: '#ec4899', recurring: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 's7', student: 'student-1', course_id: 'c3', title: 'English Literature', type: 'class', day: 1, start_time: '14:00', end_time: '15:30', room: 'C303', teacher: 'Ms. Davis', color: '#22c55e', recurring: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 's8', student: 'student-1', course_id: 'c3', title: 'English Literature', type: 'class', day: 5, start_time: '14:00', end_time: '15:30', room: 'C303', teacher: 'Ms. Davis', color: '#22c55e', recurring: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 's9', student: 'student-1', course_id: 'c4', title: 'Computer Science', type: 'class', day: 5, start_time: '13:00', end_time: '14:30', room: 'Lab-1', teacher: 'Dr. Chen', color: '#f59e0b', recurring: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 's10', student: 'student-1', title: 'Math Midterm', type: 'exam', day: 3, start_time: '10:00', end_time: '12:00', room: 'Exam Hall', color: '#ef4444', recurring: false, notes: 'Chapters 1-5', collectionId: '', collectionName: '', created: '', updated: '' },
];

const MOCK_STUDY_SESSIONS: StudySession[] = [
    { id: 'ss1', student: 'student-1', course_id: 'c1', subject: 'Mathematics', duration: 45, type: 'pomodoro', date: today.toISOString().split('T')[0], completed: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'ss2', student: 'student-1', course_id: 'c4', subject: 'Computer Science', duration: 60, type: 'practice', date: today.toISOString().split('T')[0], completed: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'ss3', student: 'student-1', subject: 'Physics', duration: 30, type: 'flashcards', date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], completed: true, collectionId: '', collectionName: '', created: '', updated: '' },
];

const MOCK_FLASHCARD_DECKS: FlashcardDeck[] = [
    { id: 'd1', student: 'student-1', name: 'Math Formulas', subject: 'Mathematics', description: 'Key calculus and algebra formulas', card_count: 25, mastery: 72, color: '#3b82f6', is_public: false, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'd2', student: 'student-1', name: 'Physics Laws', subject: 'Physics', description: 'Newton\'s laws and thermodynamics', card_count: 18, mastery: 65, color: '#8b5cf6', is_public: false, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'd3', student: 'student-1', name: 'Literary Terms', subject: 'English', description: 'Vocabulary and literary devices', card_count: 40, mastery: 88, color: '#22c55e', is_public: true, collectionId: '', collectionName: '', created: '', updated: '' },
];

const MOCK_FLASHCARDS: Flashcard[] = [
    { id: 'f1', student: 'student-1', deck_id: 'd1', front: 'What is the derivative of x²?', back: '2x', difficulty: 'easy', review_count: 5, correct_count: 5, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'f2', student: 'student-1', deck_id: 'd1', front: 'What is the integral of 1/x?', back: 'ln|x| + C', difficulty: 'medium', review_count: 8, correct_count: 6, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'f3', student: 'student-1', deck_id: 'd2', front: 'Newton\'s First Law', back: 'An object at rest stays at rest, an object in motion stays in motion unless acted upon by an external force', difficulty: 'easy', review_count: 10, correct_count: 10, collectionId: '', collectionName: '', created: '', updated: '' },
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: 'att1', student: 'student-1', course_id: 'c1', course_name: 'Mathematics', date: today.toISOString().split('T')[0], status: 'present', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'att2', student: 'student-1', course_id: 'c2', course_name: 'Physics', date: today.toISOString().split('T')[0], status: 'present', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'att3', student: 'student-1', course_id: 'c3', course_name: 'English Literature', date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], status: 'late', notes: 'Arrived 10 minutes late', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'att4', student: 'student-1', course_id: 'c1', course_name: 'Mathematics', date: new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0], status: 'present', collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'att5', student: 'student-1', course_id: 'c5', course_name: 'History', date: new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0], status: 'excused', notes: 'Doctor appointment', collectionId: '', collectionName: '', created: '', updated: '' },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann1', title: 'Welcome Back!', content: 'Hope everyone had a great break. Let\'s make this semester count!', type: 'general', author: 'Principal Adams', date: today.toISOString(), is_read: false, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'ann2', title: 'Math Midterm Rescheduled', content: 'The midterm exam has been moved to next Wednesday. Please update your calendars.', type: 'course', course_id: 'c1', author: 'Dr. Johnson', date: new Date(today.getTime() - 86400000).toISOString(), is_read: true, collectionId: '', collectionName: '', created: '', updated: '' },
    { id: 'ann3', title: 'Science Fair Registration', content: 'Science fair registration is now open! Sign up by Friday to participate.', type: 'event', author: 'Science Department', date: new Date(today.getTime() - 2 * 86400000).toISOString(), is_read: false, collectionId: '', collectionName: '', created: '', updated: '' },
];

// ========================================
// SERVICE CLASS
// ========================================

class StudentService {
    // Courses
    async getCourses(studentId: string, status?: Course['status']): Promise<Course[]> {
        if (isMockEnv()) {
            let courses = MOCK_COURSES.filter(c => c.student === studentId);
            if (status) courses = courses.filter(c => c.status === status);
            return courses;
        }
        try {
            let filter = `student = "${studentId}"`;
            if (status) filter += ` && status = "${status}"`;
            return await pb.collection('student_courses').getFullList<Course>({ filter });
        } catch (error) {
            console.error('Failed to get courses:', error);
            return [];
        }
    }

    async getCourseById(courseId: string): Promise<Course | null> {
        if (isMockEnv()) {
            return MOCK_COURSES.find(c => c.id === courseId) || null;
        }
        try {
            return await pb.collection('student_courses').getOne<Course>(courseId);
        } catch (error) {
            console.error('Failed to get course:', error);
            return null;
        }
    }

    // Assignments
    async getAssignments(studentId: string, status?: Assignment['status']): Promise<Assignment[]> {
        if (isMockEnv()) {
            let assignments = MOCK_ASSIGNMENTS.filter(a => a.student === studentId);
            if (status) assignments = assignments.filter(a => a.status === status);
            return assignments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        }
        try {
            let filter = `student = "${studentId}"`;
            if (status) filter += ` && status = "${status}"`;
            return await pb.collection('student_assignments').getFullList<Assignment>({ filter, sort: 'due_date' });
        } catch (error) {
            console.error('Failed to get assignments:', error);
            return [];
        }
    }

    async getUpcomingAssignments(studentId: string, days: number = 7): Promise<Assignment[]> {
        const endDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
        if (isMockEnv()) {
            return MOCK_ASSIGNMENTS.filter(a => a.student === studentId && a.status === 'pending' && a.due_date <= endDate)
                .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        }
        try {
            return await pb.collection('student_assignments').getFullList<Assignment>({
                filter: `student = "${studentId}" && status = "pending" && due_date <= "${endDate}"`,
                sort: 'due_date'
            });
        } catch (error) {
            console.error('Failed to get upcoming assignments:', error);
            return [];
        }
    }

    async submitAssignment(assignmentId: string, data: { attachments?: string[]; notes?: string }): Promise<Assignment | null> {
        if (isMockEnv()) {
            const idx = MOCK_ASSIGNMENTS.findIndex(a => a.id === assignmentId);
            if (idx >= 0) {
                MOCK_ASSIGNMENTS[idx] = { 
                    ...MOCK_ASSIGNMENTS[idx], 
                    status: 'submitted', 
                    submission_date: new Date().toISOString(),
                    attachments: data.attachments 
                };
                return MOCK_ASSIGNMENTS[idx];
            }
            return null;
        }
        try {
            return await pb.collection('student_assignments').update<Assignment>(assignmentId, {
                status: 'submitted',
                submission_date: new Date().toISOString(),
                ...data
            });
        } catch (error) {
            console.error('Failed to submit assignment:', error);
            return null;
        }
    }

    // Grades
    async getGrades(studentId: string, courseId?: string): Promise<Grade[]> {
        if (isMockEnv()) {
            let grades = MOCK_GRADES.filter(g => g.student === studentId);
            if (courseId) grades = grades.filter(g => g.course_id === courseId);
            return grades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        try {
            let filter = `student = "${studentId}"`;
            if (courseId) filter += ` && course_id = "${courseId}"`;
            return await pb.collection('student_grades').getFullList<Grade>({ filter, sort: '-date' });
        } catch (error) {
            console.error('Failed to get grades:', error);
            return [];
        }
    }

    async getGPA(studentId: string): Promise<{ gpa: number; letterGrade: string }> {
        const grades = await this.getGrades(studentId);
        if (grades.length === 0) return { gpa: 0, letterGrade: 'N/A' };
        
        const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
        const weightedSum = grades.reduce((sum, g) => sum + (g.percentage * g.weight), 0);
        const avgPercentage = weightedSum / totalWeight;
        
        const gpa = (avgPercentage / 100) * 4;
        const letterGrade = avgPercentage >= 93 ? 'A' : avgPercentage >= 90 ? 'A-' : avgPercentage >= 87 ? 'B+' : 
                           avgPercentage >= 83 ? 'B' : avgPercentage >= 80 ? 'B-' : avgPercentage >= 77 ? 'C+' :
                           avgPercentage >= 73 ? 'C' : avgPercentage >= 70 ? 'C-' : avgPercentage >= 67 ? 'D+' :
                           avgPercentage >= 60 ? 'D' : 'F';
        
        return { gpa: Math.round(gpa * 100) / 100, letterGrade };
    }

    // Schedule
    async getSchedule(studentId: string, day?: number): Promise<ScheduleItem[]> {
        if (isMockEnv()) {
            let schedule = MOCK_SCHEDULE.filter(s => s.student === studentId);
            if (day !== undefined) schedule = schedule.filter(s => s.day === day);
            return schedule.sort((a, b) => a.start_time.localeCompare(b.start_time));
        }
        try {
            let filter = `student = "${studentId}"`;
            if (day !== undefined) filter += ` && day = ${day}`;
            return await pb.collection('student_schedule').getFullList<ScheduleItem>({ filter, sort: 'start_time' });
        } catch (error) {
            console.error('Failed to get schedule:', error);
            return [];
        }
    }

    async addScheduleItem(studentId: string, data: Partial<ScheduleItem>): Promise<ScheduleItem | null> {
        if (isMockEnv()) {
            const newItem: ScheduleItem = {
                id: `s-${Date.now()}`, student: studentId, title: data.title || 'Event',
                type: data.type || 'event', day: data.day || 0, start_time: data.start_time || '09:00',
                end_time: data.end_time || '10:00', room: data.room, teacher: data.teacher,
                color: data.color || '#6b7280', recurring: data.recurring || false, notes: data.notes,
                collectionId: '', collectionName: '', created: new Date().toISOString(), updated: ''
            };
            MOCK_SCHEDULE.push(newItem);
            return newItem;
        }
        try {
            return await pb.collection('student_schedule').create<ScheduleItem>({ student: studentId, ...data });
        } catch (error) {
            console.error('Failed to add schedule item:', error);
            return null;
        }
    }

    // Study Sessions
    async getStudySessions(studentId: string, days: number = 7): Promise<StudySession[]> {
        const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
        if (isMockEnv()) {
            return MOCK_STUDY_SESSIONS.filter(s => s.student === studentId && s.date >= startDate);
        }
        try {
            return await pb.collection('study_sessions').getFullList<StudySession>({
                filter: `student = "${studentId}" && date >= "${startDate}"`,
                sort: '-date'
            });
        } catch (error) {
            console.error('Failed to get study sessions:', error);
            return [];
        }
    }

    async logStudySession(studentId: string, data: Partial<StudySession>): Promise<StudySession | null> {
        if (isMockEnv()) {
            const session: StudySession = {
                id: `ss-${Date.now()}`, student: studentId, duration: data.duration || 25,
                type: data.type || 'pomodoro', date: new Date().toISOString().split('T')[0],
                completed: true, subject: data.subject, course_id: data.course_id, notes: data.notes,
                collectionId: '', collectionName: '', created: new Date().toISOString(), updated: ''
            };
            MOCK_STUDY_SESSIONS.push(session);
            return session;
        }
        try {
            return await pb.collection('study_sessions').create<StudySession>({ student: studentId, completed: true, date: new Date().toISOString().split('T')[0], ...data });
        } catch (error) {
            console.error('Failed to log study session:', error);
            return null;
        }
    }

    async getTotalStudyTime(studentId: string, days: number = 7): Promise<number> {
        const sessions = await this.getStudySessions(studentId, days);
        return sessions.reduce((sum, s) => sum + s.duration, 0);
    }

    // Flashcards
    async getFlashcardDecks(studentId: string): Promise<FlashcardDeck[]> {
        if (isMockEnv()) {
            return MOCK_FLASHCARD_DECKS.filter(d => d.student === studentId);
        }
        try {
            return await pb.collection('flashcard_decks').getFullList<FlashcardDeck>({ filter: `student = "${studentId}"` });
        } catch (error) {
            console.error('Failed to get flashcard decks:', error);
            return [];
        }
    }

    async getFlashcards(deckId: string): Promise<Flashcard[]> {
        if (isMockEnv()) {
            return MOCK_FLASHCARDS.filter(f => f.deck_id === deckId);
        }
        try {
            return await pb.collection('flashcards').getFullList<Flashcard>({ filter: `deck_id = "${deckId}"` });
        } catch (error) {
            console.error('Failed to get flashcards:', error);
            return [];
        }
    }

    async createFlashcard(studentId: string, deckId: string, front: string, back: string): Promise<Flashcard | null> {
        if (isMockEnv()) {
            const card: Flashcard = {
                id: `f-${Date.now()}`, student: studentId, deck_id: deckId, front, back,
                difficulty: 'medium', review_count: 0, correct_count: 0,
                collectionId: '', collectionName: '', created: new Date().toISOString(), updated: ''
            };
            MOCK_FLASHCARDS.push(card);
            const deck = MOCK_FLASHCARD_DECKS.find(d => d.id === deckId);
            if (deck) deck.card_count++;
            return card;
        }
        try {
            return await pb.collection('flashcards').create<Flashcard>({ student: studentId, deck_id: deckId, front, back, difficulty: 'medium', review_count: 0, correct_count: 0 });
        } catch (error) {
            console.error('Failed to create flashcard:', error);
            return null;
        }
    }

    async reviewFlashcard(cardId: string, correct: boolean): Promise<Flashcard | null> {
        if (isMockEnv()) {
            const card = MOCK_FLASHCARDS.find(f => f.id === cardId);
            if (card) {
                card.review_count++;
                if (correct) card.correct_count++;
                card.last_reviewed = new Date().toISOString();
                return card;
            }
            return null;
        }
        try {
            const card = await pb.collection('flashcards').getOne<Flashcard>(cardId);
            return await pb.collection('flashcards').update<Flashcard>(cardId, {
                review_count: card.review_count + 1,
                correct_count: correct ? card.correct_count + 1 : card.correct_count,
                last_reviewed: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to review flashcard:', error);
            return null;
        }
    }

    // Attendance
    async getAttendance(studentId: string, courseId?: string): Promise<AttendanceRecord[]> {
        if (isMockEnv()) {
            let records = MOCK_ATTENDANCE.filter(a => a.student === studentId);
            if (courseId) records = records.filter(a => a.course_id === courseId);
            return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        try {
            let filter = `student = "${studentId}"`;
            if (courseId) filter += ` && course_id = "${courseId}"`;
            return await pb.collection('student_attendance').getFullList<AttendanceRecord>({ filter, sort: '-date' });
        } catch (error) {
            console.error('Failed to get attendance:', error);
            return [];
        }
    }

    async getAttendanceRate(studentId: string): Promise<number> {
        const records = await this.getAttendance(studentId);
        if (records.length === 0) return 100;
        const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
        return Math.round((present / records.length) * 100);
    }

    // Announcements
    async getAnnouncements(studentId: string): Promise<Announcement[]> {
        if (isMockEnv()) {
            return MOCK_ANNOUNCEMENTS.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        try {
            // Get course IDs for student
            const courses = await this.getCourses(studentId, 'active');
            const courseIds = courses.map(c => c.id);
            const courseFilter = courseIds.length > 0 ? ` || course_id ~ "${courseIds.join('||')}"` : '';
            return await pb.collection('announcements').getFullList<Announcement>({
                filter: `type = "general"${courseFilter}`,
                sort: '-date'
            });
        } catch (error) {
            console.error('Failed to get announcements:', error);
            return [];
        }
    }

    async markAnnouncementRead(announcementId: string): Promise<void> {
        if (isMockEnv()) {
            const ann = MOCK_ANNOUNCEMENTS.find(a => a.id === announcementId);
            if (ann) ann.is_read = true;
            return;
        }
        try {
            await pb.collection('announcements').update(announcementId, { is_read: true });
        } catch (error) {
            console.error('Failed to mark announcement read:', error);
        }
    }

    // Dashboard Stats
    async getDashboardStats(studentId: string): Promise<{
        gpa: number;
        attendanceRate: number;
        upcomingAssignments: number;
        totalStudyTime: number;
        coursesCount: number;
        streakDays: number;
    }> {
        const [gpaData, attendanceRate, assignments, studyTime, courses] = await Promise.all([
            this.getGPA(studentId),
            this.getAttendanceRate(studentId),
            this.getUpcomingAssignments(studentId, 7),
            this.getTotalStudyTime(studentId, 7),
            this.getCourses(studentId, 'active')
        ]);

        return {
            gpa: gpaData.gpa,
            attendanceRate,
            upcomingAssignments: assignments.length,
            totalStudyTime: studyTime,
            coursesCount: courses.length,
            streakDays: 5 // Would calculate from study sessions
        };
    }
}

export const studentService = new StudentService();
