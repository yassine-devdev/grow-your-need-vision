import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, EmptyState } from '../../components/shared/ui/CommonUI';
import { WidgetErrorBoundary } from '../../components/shared/ui/WidgetErrorBoundary';
import { Skeleton, SkeletonCard } from '../../components/shared/ui/Skeleton';
import { useApiError } from '../../hooks/useApiError';
import { useAuth } from '../../context/AuthContext';
import pb from '../../lib/pocketbase';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        upcomingAssignments: 0,
        pendingSubmissions: 0,
        averageGrade: 0,
        attendanceRate: 0,
        totalCourses: 0
    });
    const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const { handleError } = useApiError();

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load assignments
            const assignments = await pb.collection('assignments').getList(1, 5, {
                filter: `due_date >= "${new Date().toISOString()}"`,
                sort: 'due_date',
                expand: 'subject'
            });

            // Load submissions
            const submissions = await pb.collection('submissions').getList(1, 100, {
                filter: `student = "${user?.id}"`
            });

            // Load grades
            const grades = await pb.collection('submissions').getList(1, 100, {
                filter: `student = "${user?.id}" && grade != null`
            });

            // Load enrollments
            const enrollments = await pb.collection('enrollments').getList(1, 100, {
                filter: `student = "${user?.id}" && status = "active"`
            });

            // Load attendance
            const attendance = await pb.collection('attendance').getList(1, 100, {
                filter: `student = "${user?.id}"`
            });

            // Calculate stats
            const avgGrade = grades.items.length > 0
                ? grades.items.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.items.length
                : 0;

            const presentCount = attendance.items.filter(a => a.status === 'present').length;
            const attendanceRate = attendance.items.length > 0 
                ? Math.round((presentCount / attendance.items.length) * 100) 
                : 100;

            setStats({
                upcomingAssignments: assignments.items.length,
                pendingSubmissions: assignments.items.length - submissions.items.length,
                averageGrade: avgGrade,
                attendanceRate: attendanceRate,
                totalCourses: enrollments.items.length
            });

            setRecentAssignments(assignments.items);

            // Load announcements
            const announcementsData = await pb.collection('announcements').getList(1, 3, {
                sort: '-created',
                filter: 'target = "students" || target = "all"'
            });
            setAnnouncements(announcementsData.items);

        } catch (error) {
            handleError(error, 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="mb-8 space-y-2">
                    <Skeleton variant="text" width={300} height={40} />
                    <Skeleton variant="text" width={200} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="p-6">
                            <div className="flex justify-between">
                                <div className="space-y-2">
                                    <Skeleton variant="text" width={100} />
                                    <Skeleton variant="text" width={60} height={30} />
                                </div>
                                <Skeleton variant="circular" width={48} height={48} />
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                    <div className="space-y-4">
                        <SkeletonCard />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Here's what's happening with your studies
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">Upcoming Assignments</p>
                            <p className="text-3xl font-black text-blue-900 dark:text-white mt-2">{stats.upcomingAssignments}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <Icon name="DocumentTextIcon" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-300 font-semibold">Average Grade</p>
                            <p className="text-3xl font-black text-green-900 dark:text-white mt-2">{stats.averageGrade.toFixed(1)}%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <Icon name="AcademicCapIcon" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 dark:text-purple-300 font-semibold">Attendance Rate</p>
                            <p className="text-3xl font-black text-purple-900 dark:text-white mt-2">{stats.attendanceRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <Icon name="ClockIcon" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 dark:text-orange-300 font-semibold">Active Courses</p>
                            <p className="text-3xl font-black text-orange-900 dark:text-white mt-2">{stats.totalCourses}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                            <Icon name="BookOpenIcon" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Assignments */}
                <Card className="lg:col-span-2 p-6">
                    <WidgetErrorBoundary title="Assignments">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Assignments</h2>
                            <Link to="/student/assignments">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentAssignments.length > 0 ? (
                                recentAssignments.map(assignment => (
                                    <div key={assignment.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white">{assignment.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {assignment.expand?.subject?.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming assignments</p>
                            )}
                        </div>
                    </WidgetErrorBoundary>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/student/assignments">
                        <Button variant="outline" className="w-full">
                            <Icon name="DocumentTextIcon" className="w-5 h-5 mr-2" />
                            Assignments
                        </Button>
                    </Link>
                    <Link to="/student/grades">
                        <Button variant="outline" className="w-full">
                            <Icon name="ChartBarIcon" className="w-5 h-5 mr-2" />
                            Grades
                        </Button>
                    </Link>
                    <Link to="/student/schedule">
                        <Button variant="outline" className="w-full">
                            <Icon name="CalendarIcon" className="w-5 h-5 mr-2" />
                            Schedule
                        </Button>
                    </Link>
                    <Link to="/student/courses">
                        <Button variant="outline" className="w-full">
                            <Icon name="BookOpenIcon" className="w-5 h-5 mr-2" />
                            Courses
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default StudentDashboard;
