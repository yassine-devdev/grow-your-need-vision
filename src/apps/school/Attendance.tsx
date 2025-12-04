import React, { useState, useEffect } from 'react';
import { Heading1, Text } from '../../components/shared/ui/Typography';
import { Card } from '../../components/shared/ui/Card';
import { Button } from '../../components/shared/ui/Button';
import { Select } from '../../components/shared/ui/Select';
import { Badge } from '../../components/shared/ui/Badge';
import { Icon as OwnerIcon } from '../../components/shared/ui/CommonUI';
import pb from '../../lib/pocketbase';
import { SchoolClass, AttendanceRecord, Enrollment, Student } from './types';

interface AttendanceProps {
    activeTab?: string;
    activeSubNav?: string;
}

const Attendance: React.FC<AttendanceProps> = ({ activeTab, activeSubNav }) => {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({});
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendanceRate: 0
    });

    useEffect(() => {
        const loadClasses = async () => {
            try {
                const result = await pb.collection('school_classes').getFullList<SchoolClass>({
                    sort: 'name',
                });
                setClasses(result);
                if (result.length > 0) {
                    setSelectedClass(result[0].id);
                }
            } catch (error) {
                console.error('Failed to load classes:', error);
            }
        };
        loadClasses();
    }, []);

    // Load data when class or date changes
    useEffect(() => {
        if (selectedClass) {
            fetchData();
        }
    }, [selectedClass, attendanceDate]);

    const updateStats = (statuses: string[]) => {
        const total = statuses.length;
        const present = statuses.filter(s => s === 'Present').length;
        const absent = statuses.filter(s => s === 'Absent').length;
        const late = statuses.filter(s => s === 'Late').length;
        const excused = statuses.filter(s => s === 'Excused').length;

        setStats({
            present,
            absent,
            late,
            excused,
            attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0
        });
    };

    const fetchData = async () => {
        if (!selectedClass) return;
        setLoading(true);
        try {
            // 1. Get enrolled students
            const enrollments = await pb.collection('enrollments').getFullList<Enrollment>({
                filter: `class="${selectedClass}"`,
                expand: 'student'
            });
            
            const classStudents = enrollments
                .map((e) => e.expand?.student)
                .filter((s): s is Student => !!s);

            setStudents(classStudents);

            // 2. Get attendance for date
            const startOfDay = `${attendanceDate} 00:00:00`;
            const endOfDay = `${attendanceDate} 23:59:59`;
            
            const attendance = await pb.collection('attendance_records').getFullList<AttendanceRecord>({
                filter: `class="${selectedClass}" && date >= "${startOfDay}" && date <= "${endOfDay}"`
            });

            const statusMap: Record<string, string> = {};
            attendance.forEach((a) => {
                statusMap[a.student] = a.status;
            });
            setAttendanceStatus(statusMap);

            // 3. Update stats
            updateStats(Object.values(statusMap));

        } catch (error) {
            console.error('Failed to load attendance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (studentId: string, status: AttendanceRecord['status']) => {
        // Optimistic update
        setAttendanceStatus(prev => {
            const newStatus = { ...prev, [studentId]: status };
            updateStats(Object.values(newStatus));
            return newStatus;
        });

        try {
            const startOfDay = `${attendanceDate} 00:00:00`;
            const endOfDay = `${attendanceDate} 23:59:59`;

            // Check if record exists
            const existingRecords = await pb.collection('attendance_records').getList<AttendanceRecord>(1, 1, {
                filter: `class="${selectedClass}" && student="${studentId}" && date >= "${startOfDay}" && date <= "${endOfDay}"`
            });

            if (existingRecords.items.length > 0) {
                await pb.collection('attendance_records').update(existingRecords.items[0].id, { status });
            } else {
                await pb.collection('attendance_records').create({
                    class: selectedClass,
                    date: `${attendanceDate} 12:00:00`, // Set a default time
                    student: studentId,
                    status
                });
            }
        } catch (error) {
            console.error('Failed to mark attendance:', error);
            // Revert on error (could add toast here)
            fetchData();
        }
    };

    const handleBulkMark = async (status: AttendanceRecord['status']) => {
        if (!window.confirm(`Mark all unmarked students as ${status}?`)) return;

        const unmarkedStudents = students
            .filter(s => !attendanceStatus[s.id])
            .map(s => s.id);

        if (unmarkedStudents.length === 0) return;

        setLoading(true);
        try {
            const promises = unmarkedStudents.map(studentId => 
                pb.collection('attendance_records').create({
                    class: selectedClass,
                    date: `${attendanceDate} 12:00:00`,
                    student: studentId,
                    status
                })
            );
            await Promise.all(promises);
            await fetchData();
        } catch (error) {
            console.error('Failed to bulk mark attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn p-6">
            <div className="flex justify-between items-start">
                <div>
                    <Heading1>Attendance Tracking</Heading1>
                    <Text variant="muted">Manage daily attendance for your classes</Text>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => handleBulkMark('Present')}
                        disabled={loading || !selectedClass}
                    >
                        Mark Remaining Present
                    </Button>
                </div>
            </div>

            {/* Controls & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 p-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <Select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                <option value="">Select a class...</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} ({cls.code})
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gyn-blue-medium focus:border-transparent"
                                value={attendanceDate}
                                onChange={e => setAttendanceDate(e.target.value)}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Attendance Rate</span>
                        <span className={`text-xl font-bold ${stats.attendanceRate >= 90 ? 'text-green-600' : stats.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {stats.attendanceRate}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full ${stats.attendanceRate >= 90 ? 'bg-green-600' : stats.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-600'}`}
                            style={{ width: `${stats.attendanceRate}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-500">
                        <span>Present: {stats.present}</span>
                        <span>Absent: {stats.absent}</span>
                        <span>Late: {stats.late}</span>
                    </div>
                </Card>
            </div>

            {/* Student List */}
            <Card>
                {loading && students.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gyn-blue-medium"></div>
                    </div>
                ) : !selectedClass ? (
                    <div className="text-center py-12">
                        <OwnerIcon name="AcademicCapIcon" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <Text variant="muted">Select a class to view student list</Text>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12">
                        <OwnerIcon name="UsersIcon" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <Text variant="muted">No students enrolled in this class</Text>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-24">Present</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-24">Absent</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-24">Late</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-24">Excused</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-32">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => {
                                    const status = attendanceStatus[student.id];
                                    return (
                                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gyn-blue-light flex items-center justify-center text-gyn-blue-dark font-medium text-sm">
                                                        {student.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{student.name}</div>
                                                        <div className="text-xs text-gray-500">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleMarkAttendance(student.id, 'Present')}
                                                    className={`p-2 rounded-full transition-colors ${status === 'Present' ? 'bg-green-100 text-green-600 ring-2 ring-green-500' : 'text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    <OwnerIcon name="CheckCircleIcon" className="w-6 h-6" />
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleMarkAttendance(student.id, 'Absent')}
                                                    className={`p-2 rounded-full transition-colors ${status === 'Absent' ? 'bg-red-100 text-red-600 ring-2 ring-red-500' : 'text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    <OwnerIcon name="XCircleIcon" className="w-6 h-6" />
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleMarkAttendance(student.id, 'Late')}
                                                    className={`p-2 rounded-full transition-colors ${status === 'Late' ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-500' : 'text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    <OwnerIcon name="ClockIcon" className="w-6 h-6" />
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleMarkAttendance(student.id, 'Excused')}
                                                    className={`p-2 rounded-full transition-colors ${status === 'Excused' ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' : 'text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    <OwnerIcon name="InformationCircleIcon" className="w-6 h-6" />
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {status ? (
                                                    <Badge variant={
                                                        status === 'Present' ? 'success' :
                                                            status === 'Absent' ? 'danger' :
                                                                status === 'Late' ? 'warning' : 'neutral'
                                                    }>
                                                        {status}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Not marked</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Attendance;
