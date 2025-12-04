import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

export interface AttendanceRecord extends RecordModel {
    student: string;
    class: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    marked_by?: string;
    expand?: {
        student?: RecordModel;
        class?: RecordModel;
    }
}

export const attendanceService = {
    /**
     * Get attendance for a specific class and date
     */
    async getClassAttendance(classId: string, date: string) {
        // Ensure date is in YYYY-MM-DD format for query
        const dateStr = date.split('T')[0];

        return await pb.collection('attendance_records').getFullList<AttendanceRecord>({
            filter: `class = "${classId}" && date >= "${dateStr} 00:00:00" && date <= "${dateStr} 23:59:59"`,
            expand: 'student',
            requestKey: null
        });
    },

    /**
     * Get attendance history for a student
     */
    async getStudentAttendance(studentId: string, page = 1, perPage = 50) {
        return await pb.collection('attendance_records').getList<AttendanceRecord>(page, perPage, {
            filter: `student = "${studentId}"`,
            sort: '-date',
            expand: 'class',
            requestKey: null
        });
    },

    /**
     * Mark attendance for a single student
     */
    async markAttendance(studentId: string, classId: string, date: string, status: AttendanceRecord['status']) {
        const dateStr = date.split('T')[0];

        // Check for existing record
        const existing = await pb.collection('attendance_records').getList<AttendanceRecord>(1, 1, {
            filter: `student = "${studentId}" && class = "${classId}" && date >= "${dateStr} 00:00:00" && date <= "${dateStr} 23:59:59"`,
            requestKey: null
        });

        if (existing.items.length > 0) {
            return await pb.collection('attendance_records').update(existing.items[0].id, { status });
        } else {
            return await pb.collection('attendance_records').create({
                student: studentId,
                class: classId,
                date: new Date(date).toISOString(),
                status
            });
        }
    },

    /**
     * Bulk mark attendance for multiple students
     */
    async bulkMarkAttendance(studentIds: string[], classId: string, date: string, status: AttendanceRecord['status']) {
        const promises = studentIds.map(studentId => this.markAttendance(studentId, classId, date, status));
        return await Promise.all(promises);
    },

    /**
     * Get attendance statistics for a class
     */
    async getClassStats(classId: string) {
        const records = await pb.collection('attendance_records').getFullList<AttendanceRecord>({
            filter: `class = "${classId}"`,
            requestKey: null
        });

        const total = records.length;
        if (total === 0) return { present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0 };

        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const excused = records.filter(r => r.status === 'Excused').length;

        return {
            present,
            absent,
            late,
            excused,
            attendanceRate: Math.round(((present + late) / total) * 100)
        };
    }
};
