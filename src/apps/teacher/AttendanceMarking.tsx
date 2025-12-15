import React, { useState, useEffect } from 'react';
import pb from '../../lib/pocketbase';
import { useToast } from '../../hooks/useToast';
import { useApiError } from '../../hooks/useApiError';
import { Button, Card, Icon, EmptyState, Skeleton } from '../../components/shared/ui/CommonUI';
import { WidgetErrorBoundary } from '../../components/shared/ui/WidgetErrorBoundary';
import { useAuth } from '../../context/AuthContext';

interface Student {
    id: string;
    name: string;
    avatar?: string;
    status?: 'present' | 'absent' | 'late' | 'excused';
}

export const AttendanceMarking: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { handleError } = useApiError();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            loadStudents(selectedClass);
        }
    }, [selectedClass, attendanceDate]);

    const loadClasses = async () => {
        setLoading(true);
        try {
            const classesData = await pb.collection('classes').getList(1, 50, {
                sort: 'name'
            });
            setClasses(classesData.items);
            if (classesData.items.length > 0) {
                setSelectedClass(classesData.items[0].id);
            }
        } catch (error) {
            handleError(error, 'Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async (classId: string) => {
        try {
            // Load students in this class
            const studentsData = await pb.collection('users').getList(1, 100, {
                filter: `class = "${classId}" && role = "Student"`,
                sort: 'name'
            });

            // Check existing attendance for today
            const attendanceRecords = await pb.collection('attendance').getList(1, 100, {
                filter: `class = "${classId}" && date = "${attendanceDate}"`
            });

            const attendanceMap = new Map(
                attendanceRecords.items.map((record: any) => [
                    record.student,
                    record.status
                ])
            );

            const studentsWithStatus: Student[] = studentsData.items.map((student: any) => ({
                id: student.id,
                name: student.name,
                avatar: student.avatar,
                status: attendanceMap.get(student.id) || undefined
            }));

            setStudents(studentsWithStatus);
        } catch (error) {
            handleError(error, 'Failed to load students');
        }
    };

    const markAttendance = (studentId: string, status: Student['status']) => {
        setStudents(prev =>
            prev.map(student =>
                student.id === studentId ? { ...student, status } : student
            )
        );
    };

    const markAll = (status: Student['status']) => {
        setStudents(prev =>
            prev.map(student => ({ ...student, status }))
        );
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            for (const student of students) {
                if (student.status) {
                    // Check if attendance record already exists
                    const existing = await pb.collection('attendance').getList(1, 1, {
                        filter: `student = "${student.id}" && class = "${selectedClass}" && date = "${attendanceDate}"`
                    });

                    const data = {
                        student: student.id,
                        class: selectedClass,
                        date: attendanceDate,
                        status: student.status
                    };

                    if (existing.items.length > 0) {
                        // Update existing
                        await pb.collection('attendance').update(existing.items[0].id, data);
                    } else {
                        // Create new
                        await pb.collection('attendance').create(data);
                    }
                }
            }

            showToast('Attendance saved successfully!', 'success');
        } catch (error) {
            handleError(error, 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status?: Student['status']) => {
        switch (status) {
            case 'present': return 'bg-green-500';
            case 'absent': return 'bg-red-500';
            case 'late': return 'bg-orange-500';
            case 'excused': return 'bg-blue-500';
            default: return 'bg-gray-300';
        }
    };

    const stats = {
        total: students.length,
        present: students.filter(s => s.status === 'present').length,
        absent: students.filter(s => s.status === 'absent').length,
        late: students.filter(s => s.status === 'late').length,
        unmarked: students.filter(s => !s.status).length
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="space-y-2">
                        <Skeleton variant="text" width={250} height={40} />
                        <Skeleton variant="text" width={300} />
                    </div>
                    <Skeleton variant="rounded" width={150} height={40} />
                </div>
                <Skeleton variant="rounded" width="100%" height={100} />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} variant="rounded" height={80} />
                    ))}
                </div>
                <Skeleton variant="rounded" width="100%" height={400} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Mark Attendance</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Quick attendance marking for your classes</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2" data-testid="teacher-welcome">Ready to teach, {user?.name || 'Sarah Smith'}</p>
                </div>
                <Button
                    variant="primary"
                    onClick={saveAttendance}
                    disabled={saving || stats.unmarked === students.length}
                >
                    {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
            </div>

            {/* Class and Date Selectors */}
            <Card className="p-6">
                <WidgetErrorBoundary title="Class Selector">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Select Class</label>
                            <select
                                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Date</label>
                            <input
                                type="date"
                                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                            />
                        </div>
                    </div>
                </WidgetErrorBoundary>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Late</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unmarked</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.unmarked}</p>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-4">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => markAll('present')}>
                        <Icon name="CheckIcon" className="w-4 h-4 mr-1" />
                        Mark All Present
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => markAll('absent')}>
                        <Icon name="XMarkIcon" className="w-4 h-4 mr-1" />
                        Mark All Absent
                    </Button>
                </div>
            </Card>

            {/* Student List */}
            <Card className="p-6">
                <WidgetErrorBoundary title="Student List">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Students</h2>
                    <div className="space-y-2">
                        {students.map(student => (
                            <div
                                key={student.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <Icon name="UserIcon" className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">{student.name}</span>
                                </div>

                                <div className="flex gap-2">
                                    {(['present', 'late', 'excused', 'absent'] as const).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => markAttendance(student.id, status)}
                                            className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${student.status === status
                                                ? `${getStatusColor(status)} text-white shadow-lg`
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {students.length === 0 && (
                            <EmptyState
                                title="No Students Found"
                                description="There are no students enrolled in this class yet."
                                icon="UserGroupIcon"
                            />
                        )}
                    </div>
                </WidgetErrorBoundary>
            </Card>
        </div>
    );
};

export default AttendanceMarking;
