import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';
import { isMockEnv } from '../utils/mockData';

export interface ParentStudentLink extends RecordModel {
    parent: string;
    student: string;
    relationship: string;
    expand?: {
        student?: StudentRecord;
        parent?: ParentRecord;
    }
}

export interface StudentRecord extends RecordModel {
    name: string;
    email: string;
    grade_level: string;
    class_id?: string;
    avatar?: string;
    tenantId?: string;
}

export interface ParentRecord extends RecordModel {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    tenantId?: string;
}

export interface ChildGrade {
    id: string;
    student: string;
    subject: string;
    assignment_name: string;
    score: number;
    max_score: number;
    grade_letter: string;
    teacher: string;
    date: string;
}

export interface ChildAttendance {
    id: string;
    student: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    notes?: string;
}

export interface ChildSchedule {
    id: string;
    student: string;
    day: string;
    class_name: string;
    subject: string;
    teacher: string;
    start_time: string;
    end_time: string;
    room: string;
}

// Mock Data
const MOCK_STUDENTS: StudentRecord[] = [
    {
        id: 'student-child-1',
        name: 'Emma Wilson',
        email: 'emma@school.com',
        grade_level: '10th Grade',
        class_id: 'class-1',
        collectionId: '', collectionName: '', created: '', updated: ''
    },
    {
        id: 'student-child-2',
        name: 'James Wilson',
        email: 'james@school.com',
        grade_level: '7th Grade',
        class_id: 'class-2',
        collectionId: '', collectionName: '', created: '', updated: ''
    }
];

const MOCK_LINKS: ParentStudentLink[] = [
    {
        id: 'link-1',
        parent: 'parent-1',
        student: 'student-child-1',
        relationship: 'Mother',
        collectionId: '', collectionName: '', created: '', updated: '',
        expand: {
            student: MOCK_STUDENTS[0]
        }
    },
    {
        id: 'link-2',
        parent: 'parent-1',
        student: 'student-child-2',
        relationship: 'Mother',
        collectionId: '', collectionName: '', created: '', updated: '',
        expand: {
            student: MOCK_STUDENTS[1]
        }
    }
];

const MOCK_GRADES: ChildGrade[] = [
    { id: 'grade-1', student: 'student-child-1', subject: 'Mathematics', assignment_name: 'Algebra Quiz 1', score: 92, max_score: 100, grade_letter: 'A', teacher: 'Mr. Smith', date: '2024-02-10' },
    { id: 'grade-2', student: 'student-child-1', subject: 'Physics', assignment_name: 'Lab Report', score: 88, max_score: 100, grade_letter: 'B+', teacher: 'Dr. Johnson', date: '2024-02-08' },
    { id: 'grade-3', student: 'student-child-1', subject: 'English', assignment_name: 'Essay', score: 95, max_score: 100, grade_letter: 'A', teacher: 'Ms. Davis', date: '2024-02-05' },
    { id: 'grade-4', student: 'student-child-2', subject: 'Mathematics', assignment_name: 'Pre-Algebra Test', score: 85, max_score: 100, grade_letter: 'B', teacher: 'Mrs. Brown', date: '2024-02-12' },
    { id: 'grade-5', student: 'student-child-2', subject: 'Science', assignment_name: 'Project', score: 90, max_score: 100, grade_letter: 'A-', teacher: 'Mr. Garcia', date: '2024-02-09' }
];

const MOCK_ATTENDANCE: ChildAttendance[] = [
    { id: 'att-1', student: 'student-child-1', date: '2024-02-15', status: 'Present' },
    { id: 'att-2', student: 'student-child-1', date: '2024-02-14', status: 'Present' },
    { id: 'att-3', student: 'student-child-1', date: '2024-02-13', status: 'Late', notes: 'Arrived 10 minutes late' },
    { id: 'att-4', student: 'student-child-1', date: '2024-02-12', status: 'Present' },
    { id: 'att-5', student: 'student-child-1', date: '2024-02-11', status: 'Absent', notes: 'Sick - doctor\'s note provided' },
    { id: 'att-6', student: 'student-child-2', date: '2024-02-15', status: 'Present' },
    { id: 'att-7', student: 'student-child-2', date: '2024-02-14', status: 'Present' },
    { id: 'att-8', student: 'student-child-2', date: '2024-02-13', status: 'Excused', notes: 'Field trip' }
];

const MOCK_SCHEDULE: ChildSchedule[] = [
    { id: 'sch-1', student: 'student-child-1', day: 'Monday', class_name: 'Math 10', subject: 'Mathematics', teacher: 'Mr. Smith', start_time: '08:00', end_time: '09:00', room: 'Room 101' },
    { id: 'sch-2', student: 'student-child-1', day: 'Monday', class_name: 'Physics', subject: 'Physics', teacher: 'Dr. Johnson', start_time: '09:15', end_time: '10:15', room: 'Lab 2' },
    { id: 'sch-3', student: 'student-child-1', day: 'Monday', class_name: 'English 10', subject: 'English', teacher: 'Ms. Davis', start_time: '10:30', end_time: '11:30', room: 'Room 205' },
    { id: 'sch-4', student: 'student-child-2', day: 'Monday', class_name: 'Math 7', subject: 'Mathematics', teacher: 'Mrs. Brown', start_time: '08:00', end_time: '09:00', room: 'Room 102' },
    { id: 'sch-5', student: 'student-child-2', day: 'Monday', class_name: 'Science 7', subject: 'Science', teacher: 'Mr. Garcia', start_time: '09:15', end_time: '10:15', room: 'Lab 1' }
];

export const parentService = {
    /**
     * Get all children linked to a parent
     */
    async getChildren(parentId: string) {
        if (isMockEnv()) {
            const links = MOCK_LINKS.filter(l => l.parent === parentId);
            return links.map(link => ({
                ...link.expand?.student,
                linkId: link.id,
                relationship: link.relationship
            })).filter(child => child?.id);
        }

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
            })).filter(child => child?.id); // Filter out any where expansion failed
        } catch (error) {
            console.error('Failed to fetch children:', error);
            return [];
        }
    },

    /**
     * Get a specific child by student ID
     */
    async getChildById(parentId: string, studentId: string) {
        if (isMockEnv()) {
            const link = MOCK_LINKS.find(l => l.parent === parentId && l.student === studentId);
            if (link?.expand?.student) {
                return {
                    ...link.expand.student,
                    linkId: link.id,
                    relationship: link.relationship
                };
            }
            return null;
        }

        try {
            const link = await pb.collection('parent_student_links').getFirstListItem<ParentStudentLink>(
                `parent = "${parentId}" && student = "${studentId}"`,
                { expand: 'student' }
            );
            if (link?.expand?.student) {
                return {
                    ...link.expand.student,
                    linkId: link.id,
                    relationship: link.relationship
                };
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch child:', error);
            return null;
        }
    },

    /**
     * Get grades for a child
     */
    async getChildGrades(studentId: string): Promise<ChildGrade[]> {
        if (isMockEnv()) {
            return MOCK_GRADES.filter(g => g.student === studentId);
        }

        try {
            const grades = await pb.collection('grades').getFullList({
                filter: `student = "${studentId}"`,
                sort: '-date'
            });
            return grades as unknown as ChildGrade[];
        } catch (error) {
            console.error('Failed to fetch grades:', error);
            return [];
        }
    },

    /**
     * Get attendance for a child
     */
    async getChildAttendance(studentId: string, days: number = 30): Promise<ChildAttendance[]> {
        if (isMockEnv()) {
            return MOCK_ATTENDANCE.filter(a => a.student === studentId).slice(0, days);
        }

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const attendance = await pb.collection('attendance').getFullList({
                filter: `student = "${studentId}" && date >= "${startDate.toISOString().split('T')[0]}"`,
                sort: '-date'
            });
            return attendance as unknown as ChildAttendance[];
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            return [];
        }
    },

    /**
     * Get schedule for a child
     */
    async getChildSchedule(studentId: string): Promise<ChildSchedule[]> {
        if (isMockEnv()) {
            return MOCK_SCHEDULE.filter(s => s.student === studentId);
        }

        try {
            const schedule = await pb.collection('class_schedules').getFullList({
                filter: `student = "${studentId}"`,
                sort: 'day,start_time'
            });
            return schedule as unknown as ChildSchedule[];
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
            return [];
        }
    },

    /**
     * Get attendance statistics for a child
     */
    async getAttendanceStats(studentId: string) {
        const attendance = await this.getChildAttendance(studentId, 30);
        
        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'Present').length,
            absent: attendance.filter(a => a.status === 'Absent').length,
            late: attendance.filter(a => a.status === 'Late').length,
            excused: attendance.filter(a => a.status === 'Excused').length,
            attendance_rate: 0
        };

        if (stats.total > 0) {
            stats.attendance_rate = Math.round(((stats.present + stats.late + stats.excused) / stats.total) * 100);
        }

        return stats;
    },

    /**
     * Get grade statistics for a child
     */
    async getGradeStats(studentId: string) {
        const grades = await this.getChildGrades(studentId);

        if (grades.length === 0) {
            return {
                total_assignments: 0,
                average_score: 0,
                highest_score: 0,
                lowest_score: 0,
                subjects: []
            };
        }

        const subjectStats: Record<string, { total: number; count: number }> = {};
        
        grades.forEach(g => {
            const percentage = (g.score / g.max_score) * 100;
            if (!subjectStats[g.subject]) {
                subjectStats[g.subject] = { total: 0, count: 0 };
            }
            subjectStats[g.subject].total += percentage;
            subjectStats[g.subject].count++;
        });

        const allScores = grades.map(g => (g.score / g.max_score) * 100);

        return {
            total_assignments: grades.length,
            average_score: Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length),
            highest_score: Math.round(Math.max(...allScores)),
            lowest_score: Math.round(Math.min(...allScores)),
            subjects: Object.entries(subjectStats).map(([name, stats]) => ({
                name,
                average: Math.round(stats.total / stats.count),
                assignments: stats.count
            }))
        };
    },

    /**
     * Get child dashboard summary
     */
    async getChildDashboard(studentId: string) {
        const [grades, attendance, schedule] = await Promise.all([
            this.getChildGrades(studentId),
            this.getChildAttendance(studentId, 7),
            this.getChildSchedule(studentId)
        ]);

        const recentGrades = grades.slice(0, 5);
        const todaySchedule = schedule.filter(s => {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            return s.day === today;
        });

        const attendanceStats = await this.getAttendanceStats(studentId);
        const gradeStats = await this.getGradeStats(studentId);

        return {
            recentGrades,
            recentAttendance: attendance,
            todaySchedule,
            attendanceStats,
            gradeStats
        };
    },

    /**
     * Link a student to a parent (usually done by admin, but maybe useful)
     */
    async linkChild(parentId: string, studentId: string, relationship: string = 'Parent'): Promise<ParentStudentLink | null> {
        if (isMockEnv()) {
            const newLink: ParentStudentLink = {
                id: `link-${Date.now()}`,
                parent: parentId,
                student: studentId,
                relationship,
                collectionId: '', collectionName: '', created: new Date().toISOString(), updated: ''
            };
            MOCK_LINKS.push(newLink);
            return newLink;
        }

        try {
            return await pb.collection('parent_student_links').create({
                parent: parentId,
                student: studentId,
                relationship
            });
        } catch (error) {
            console.error('Failed to link child:', error);
            return null;
        }
    },

    /**
     * Unlink a student from a parent
     */
    async unlinkChild(linkId: string): Promise<boolean> {
        if (isMockEnv()) {
            const index = MOCK_LINKS.findIndex(l => l.id === linkId);
            if (index !== -1) {
                MOCK_LINKS.splice(index, 1);
            }
            return true;
        }

        try {
            await pb.collection('parent_student_links').delete(linkId);
            return true;
        } catch (error) {
            console.error('Failed to unlink child:', error);
            return false;
        }
    },

    /**
     * Update relationship type
     */
    async updateRelationship(linkId: string, relationship: string): Promise<ParentStudentLink | null> {
        if (isMockEnv()) {
            const link = MOCK_LINKS.find(l => l.id === linkId);
            if (link) {
                link.relationship = relationship;
            }
            return link || null;
        }

        try {
            return await pb.collection('parent_student_links').update(linkId, { relationship });
        } catch (error) {
            console.error('Failed to update relationship:', error);
            return null;
        }
    }
};
