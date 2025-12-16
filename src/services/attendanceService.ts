import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';
import { isMockEnv } from '../utils/mockData';
import { auditLog } from './auditLogger';

export interface AttendanceRecord extends RecordModel {
    student: string;
    class: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    marked_by?: string;
    notes?: string;
    arrival_time?: string;
    departure_time?: string;
    expand?: {
        student?: RecordModel & { name?: string };
        class?: RecordModel & { name?: string };
        marked_by?: RecordModel & { name?: string };
    }
}

export interface AttendanceStats {
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
    totalDays: number;
}

const MOCK_ATTENDANCE: AttendanceRecord[] = [
    {
        id: 'att-1',
        collectionId: 'mock',
        collectionName: 'attendance_records',
        student: 'student-1',
        class: 'class-1',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        marked_by: 'teacher-1',
        arrival_time: '08:00',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        expand: {
            student: { id: 'student-1', collectionId: 'mock', collectionName: 'users', name: 'John Smith', created: '', updated: '' },
            class: { id: 'class-1', collectionId: 'mock', collectionName: 'classes', name: 'Mathematics 101', created: '', updated: '' }
        }
    },
    {
        id: 'att-2',
        collectionId: 'mock',
        collectionName: 'attendance_records',
        student: 'student-2',
        class: 'class-1',
        date: new Date().toISOString().split('T')[0],
        status: 'Late',
        marked_by: 'teacher-1',
        arrival_time: '08:15',
        notes: 'Traffic delay',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        expand: {
            student: { id: 'student-2', collectionId: 'mock', collectionName: 'users', name: 'Jane Doe', created: '', updated: '' }
        }
    },
    {
        id: 'att-3',
        collectionId: 'mock',
        collectionName: 'attendance_records',
        student: 'student-3',
        class: 'class-1',
        date: new Date().toISOString().split('T')[0],
        status: 'Absent',
        marked_by: 'teacher-1',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    },
    {
        id: 'att-4',
        collectionId: 'mock',
        collectionName: 'attendance_records',
        student: 'student-1',
        class: 'class-1',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Present',
        marked_by: 'teacher-1',
        created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
];

export const attendanceService = {
    /**
     * Get attendance for a specific class and date
     */
    async getClassAttendance(classId: string, date: string) {
        const dateStr = date.split('T')[0];

        if (isMockEnv()) {
            return MOCK_ATTENDANCE.filter(a => 
                a.class === classId && a.date === dateStr
            );
        }

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
        if (isMockEnv()) {
            const filtered = MOCK_ATTENDANCE.filter(a => a.student === studentId);
            const start = (page - 1) * perPage;
            const items = filtered.slice(start, start + perPage);
            return {
                items,
                page,
                perPage,
                totalItems: filtered.length,
                totalPages: Math.ceil(filtered.length / perPage)
            };
        }

        return await pb.collection('attendance_records').getList<AttendanceRecord>(page, perPage, {
            filter: `student = "${studentId}"`,
            sort: '-date',
            expand: 'class',
            requestKey: null
        });
    },

    /**
     * Get attendance record by ID
     */
    async getAttendance(id: string) {
        if (isMockEnv()) {
            const record = MOCK_ATTENDANCE.find(a => a.id === id);
            if (!record) throw new Error('Attendance record not found');
            return record;
        }
        return await pb.collection('attendance_records').getOne<AttendanceRecord>(id, {
            expand: 'student,class,marked_by',
            requestKey: null
        });
    },

    /**
     * Mark attendance for a single student
     */
    async markAttendance(
        studentId: string, 
        classId: string, 
        date: string, 
        status: AttendanceRecord['status'],
        options?: {
            markedBy?: string;
            notes?: string;
            arrivalTime?: string;
        }
    ) {
        const dateStr = date.split('T')[0];

        if (isMockEnv()) {
            // Check for existing record
            const existingIndex = MOCK_ATTENDANCE.findIndex(a => 
                a.student === studentId && a.class === classId && a.date === dateStr
            );

            if (existingIndex !== -1) {
                MOCK_ATTENDANCE[existingIndex] = {
                    ...MOCK_ATTENDANCE[existingIndex],
                    status,
                    notes: options?.notes,
                    arrival_time: options?.arrivalTime,
                    updated: new Date().toISOString()
                };
                return MOCK_ATTENDANCE[existingIndex];
            } else {
                const newRecord: AttendanceRecord = {
                    id: `att-${Date.now()}`,
                    collectionId: 'mock',
                    collectionName: 'attendance_records',
                    student: studentId,
                    class: classId,
                    date: dateStr,
                    status,
                    marked_by: options?.markedBy,
                    notes: options?.notes,
                    arrival_time: options?.arrivalTime,
                    created: new Date().toISOString(),
                    updated: new Date().toISOString()
                };
                MOCK_ATTENDANCE.push(newRecord);
                auditLog.log('attendance_marked', { studentId, classId, status }, 'info');
                return newRecord;
            }
        }

        // Check for existing record
        const existing = await pb.collection('attendance_records').getList<AttendanceRecord>(1, 1, {
            filter: `student = "${studentId}" && class = "${classId}" && date >= "${dateStr} 00:00:00" && date <= "${dateStr} 23:59:59"`,
            requestKey: null
        });

        if (existing.items.length > 0) {
            const updated = await pb.collection('attendance_records').update<AttendanceRecord>(existing.items[0].id, { 
                status,
                notes: options?.notes,
                arrival_time: options?.arrivalTime
            });
            return updated;
        } else {
            const created = await pb.collection('attendance_records').create<AttendanceRecord>({
                student: studentId,
                class: classId,
                date: new Date(date).toISOString(),
                status,
                marked_by: options?.markedBy,
                notes: options?.notes,
                arrival_time: options?.arrivalTime
            });
            auditLog.log('attendance_marked', { studentId, classId, status }, 'info');
            return created;
        }
    },

    /**
     * Bulk mark attendance for multiple students
     */
    async bulkMarkAttendance(
        records: Array<{ studentId: string; status: AttendanceRecord['status']; notes?: string }>,
        classId: string, 
        date: string,
        markedBy?: string
    ) {
        const results: { success: AttendanceRecord[]; failed: string[] } = { success: [], failed: [] };

        for (const record of records) {
            try {
                const marked = await this.markAttendance(
                    record.studentId, 
                    classId, 
                    date, 
                    record.status,
                    { markedBy, notes: record.notes }
                );
                results.success.push(marked);
            } catch (error) {
                results.failed.push(record.studentId);
            }
        }

        auditLog.log('bulk_attendance_marked', { 
            classId, 
            date, 
            total: records.length, 
            success: results.success.length 
        }, 'info');

        return results;
    },

    /**
     * Get attendance statistics for a class
     */
    async getClassStats(classId: string, dateRange?: { start: string; end: string }): Promise<AttendanceStats> {
        let records: AttendanceRecord[];

        if (isMockEnv()) {
            records = MOCK_ATTENDANCE.filter(a => a.class === classId);
            if (dateRange) {
                records = records.filter(a => 
                    a.date >= dateRange.start && a.date <= dateRange.end
                );
            }
        } else {
            let filter = `class = "${classId}"`;
            if (dateRange) {
                filter += ` && date >= "${dateRange.start}" && date <= "${dateRange.end}"`;
            }
            records = await pb.collection('attendance_records').getFullList<AttendanceRecord>({
                filter,
                requestKey: null
            });
        }

        const total = records.length;
        if (total === 0) return { present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0, totalDays: 0 };

        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const excused = records.filter(r => r.status === 'Excused').length;
        const uniqueDays = new Set(records.map(r => r.date)).size;

        return {
            present,
            absent,
            late,
            excused,
            attendanceRate: Math.round(((present + late) / total) * 100),
            totalDays: uniqueDays
        };
    },

    /**
     * Get attendance statistics for a student
     */
    async getStudentStats(studentId: string, dateRange?: { start: string; end: string }): Promise<AttendanceStats> {
        let records: AttendanceRecord[];

        if (isMockEnv()) {
            records = MOCK_ATTENDANCE.filter(a => a.student === studentId);
            if (dateRange) {
                records = records.filter(a => 
                    a.date >= dateRange.start && a.date <= dateRange.end
                );
            }
        } else {
            let filter = `student = "${studentId}"`;
            if (dateRange) {
                filter += ` && date >= "${dateRange.start}" && date <= "${dateRange.end}"`;
            }
            records = await pb.collection('attendance_records').getFullList<AttendanceRecord>({
                filter,
                requestKey: null
            });
        }

        const total = records.length;
        if (total === 0) return { present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0, totalDays: 0 };

        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const excused = records.filter(r => r.status === 'Excused').length;
        const uniqueDays = new Set(records.map(r => r.date)).size;

        return {
            present,
            absent,
            late,
            excused,
            attendanceRate: Math.round(((present + late) / total) * 100),
            totalDays: uniqueDays
        };
    },

    /**
     * Get students with low attendance (below threshold)
     */
    async getLowAttendanceStudents(classId: string, threshold = 80): Promise<Array<{
        studentId: string;
        studentName: string;
        attendanceRate: number;
    }>> {
        if (isMockEnv()) {
            // Group by student
            const studentMap = new Map<string, { present: number; total: number; name: string }>();
            
            for (const record of MOCK_ATTENDANCE.filter(a => a.class === classId)) {
                const current = studentMap.get(record.student) || { present: 0, total: 0, name: record.expand?.student?.name || 'Unknown' };
                current.total++;
                if (record.status === 'Present' || record.status === 'Late') {
                    current.present++;
                }
                studentMap.set(record.student, current);
            }

            const result: Array<{ studentId: string; studentName: string; attendanceRate: number }> = [];
            studentMap.forEach((data, studentId) => {
                const rate = Math.round((data.present / data.total) * 100);
                if (rate < threshold) {
                    result.push({ studentId, studentName: data.name, attendanceRate: rate });
                }
            });

            return result.sort((a, b) => a.attendanceRate - b.attendanceRate);
        }

        // Get all attendance for the class
        const records = await pb.collection('attendance_records').getFullList<AttendanceRecord>({
            filter: `class = "${classId}"`,
            expand: 'student',
            requestKey: null
        });

        // Group by student
        const studentMap = new Map<string, { present: number; total: number; name: string }>();
        
        for (const record of records) {
            const current = studentMap.get(record.student) || { present: 0, total: 0, name: record.expand?.student?.name || 'Unknown' };
            current.total++;
            if (record.status === 'Present' || record.status === 'Late') {
                current.present++;
            }
            studentMap.set(record.student, current);
        }

        const result: Array<{ studentId: string; studentName: string; attendanceRate: number }> = [];
        studentMap.forEach((data, studentId) => {
            const rate = Math.round((data.present / data.total) * 100);
            if (rate < threshold) {
                result.push({ studentId, studentName: data.name, attendanceRate: rate });
            }
        });

        return result.sort((a, b) => a.attendanceRate - b.attendanceRate);
    },

    /**
     * Get attendance for date range
     */
    async getAttendanceByDateRange(classId: string, startDate: string, endDate: string) {
        if (isMockEnv()) {
            return MOCK_ATTENDANCE.filter(a => 
                a.class === classId && 
                a.date >= startDate && 
                a.date <= endDate
            );
        }

        return await pb.collection('attendance_records').getFullList<AttendanceRecord>({
            filter: `class = "${classId}" && date >= "${startDate}" && date <= "${endDate}"`,
            expand: 'student',
            sort: 'date',
            requestKey: null
        });
    },

    /**
     * Get today's attendance summary for all classes
     */
    async getTodaySummary() {
        const today = new Date().toISOString().split('T')[0];

        if (isMockEnv()) {
            const todayRecords = MOCK_ATTENDANCE.filter(a => a.date === today);
            const classes = new Set(todayRecords.map(a => a.class));
            
            return {
                date: today,
                totalRecords: todayRecords.length,
                classesMarked: classes.size,
                present: todayRecords.filter(r => r.status === 'Present').length,
                absent: todayRecords.filter(r => r.status === 'Absent').length,
                late: todayRecords.filter(r => r.status === 'Late').length,
                excused: todayRecords.filter(r => r.status === 'Excused').length
            };
        }

        const records = await pb.collection('attendance_records').getFullList<AttendanceRecord>({
            filter: `date >= "${today} 00:00:00" && date <= "${today} 23:59:59"`,
            requestKey: null
        });

        const classes = new Set(records.map(a => a.class));

        return {
            date: today,
            totalRecords: records.length,
            classesMarked: classes.size,
            present: records.filter(r => r.status === 'Present').length,
            absent: records.filter(r => r.status === 'Absent').length,
            late: records.filter(r => r.status === 'Late').length,
            excused: records.filter(r => r.status === 'Excused').length
        };
    },

    /**
     * Export attendance data
     */
    async exportAttendance(classId: string, dateRange: { start: string; end: string }): Promise<{
        className: string;
        dateRange: { start: string; end: string };
        records: Array<{
            date: string;
            studentName: string;
            status: string;
            notes?: string;
            arrivalTime?: string;
        }>;
        summary: AttendanceStats;
    }> {
        const records = await this.getAttendanceByDateRange(classId, dateRange.start, dateRange.end);
        const stats = await this.getClassStats(classId, dateRange);

        return {
            className: records[0]?.expand?.class?.name || classId,
            dateRange,
            records: records.map(r => ({
                date: r.date,
                studentName: r.expand?.student?.name || r.student,
                status: r.status,
                notes: r.notes,
                arrivalTime: r.arrival_time
            })),
            summary: stats
        };
    }
};
