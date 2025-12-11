import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, EmptyState } from '../../components/shared/ui/CommonUI';
import { WidgetErrorBoundary } from '../../components/shared/ui/WidgetErrorBoundary';
import { Skeleton, SkeletonCard } from '../../components/shared/ui/Skeleton';
import { useApiError } from '../../hooks/useApiError';
import { useAuth } from '../../context/AuthContext';
import pb from '../../lib/pocketbase';
import { Link } from 'react-router-dom';

interface Child {
    id: string;
    name: string;
    grade: string;
    class: string;
    avatar?: string;
}

export const ParentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [childStats, setChildStats] = useState({
        attendanceRate: 0,
        averageGrade: 0,
        upcomingAssignments: 0,
        unreadMessages: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadChildren();
    }, []);

    const { handleError } = useApiError();

    useEffect(() => {
        if (selectedChild) {
            loadChildData(selectedChild.id);
        }
    }, [selectedChild]);

    const loadChildren = async () => {
        setLoading(true);
        try {
            // Load children linked to this parent
            const childrenData = await pb.collection('users').getList(1, 10, {
                filter: `parent = "${user?.id}" && role = "Student"`,
                sort: 'name'
            });

            const childrenList: Child[] = childrenData.items.map((child: any) => ({
                id: child.id,
                name: child.name,
                grade: child.grade || 'N/A',
                class: child.class_name || 'N/A',
                avatar: child.avatar
            }));

            setChildren(childrenList);
            if (childrenList.length > 0) {
                setSelectedChild(childrenList[0]);
            }
        } catch (error) {
            handleError(error, 'Failed to load children');
        } finally {
            setLoading(false);
        }
    };

    const loadChildData = async (childId: string) => {
        try {
            // Load attendance
            const attendance = await pb.collection('attendance').getList(1, 100, {
                filter: `student = "${childId}"`
            });

            const attendanceRate = attendance.items.length > 0
                ? (attendance.items.filter((a: any) => a.status === 'present').length / attendance.items.length) * 100
                : 0;

            // Load grades
            const grades = await pb.collection('submissions').getList(1, 100, {
                filter: `student = "${childId}" && grade != null`
            });

            const avgGrade = grades.items.length > 0
                ? grades.items.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.items.length
                : 0;

            // Load upcoming assignments
            const assignments = await pb.collection('assignments').getList(1, 100, {
                filter: `due_date >= "${new Date().toISOString()}"`
            });

            // Load unread messages
            const unreadMessages = await pb.collection('messages').getList(1, 1, {
                filter: `recipient = "${user?.id}" && read_at = ""`
            });

            setChildStats({
                attendanceRate,
                averageGrade: avgGrade,
                upcomingAssignments: assignments.items.length,
                unreadMessages: unreadMessages.totalItems
            });

            // Load recent activity
            const activity = await pb.collection('submissions').getList(1, 5, {
                filter: `student = "${childId}"`,
                sort: '-created',
                expand: 'assignment,assignment.subject'
            });

            setRecentActivity(activity.items);

        } catch (error) {
            handleError(error, 'Failed to load child data');
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between mb-8">
                    <div className="space-y-2">
                        <Skeleton variant="text" width={300} height={40} />
                        <Skeleton variant="text" width={200} />
                    </div>
                    <Skeleton variant="rounded" width={200} height={40} />
                </div>
                <Skeleton variant="rounded" width="100%" height={128} className="mb-6" />
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
                <SkeletonCard />
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="p-6">
                <Card className="p-12">
                    <EmptyState
                        title="No Children Linked"
                        description="Please contact the school administrator to link your children's accounts to your profile."
                        icon="UserGroupIcon"
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header with Child Selector */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Parent Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor your child's progress</p>
                </div>

                {/* Child Selector Dropdown */}
                <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Viewing:</label>
                    <select
                        className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={selectedChild?.id}
                        onChange={(e) => {
                            const child = children.find(c => c.id === e.target.value);
                            if (child) setSelectedChild(child);
                        }}
                    >
                        {children.map(child => (
                            <option key={child.id} value={child.id}>
                                {child.name} - Grade {child.grade}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedChild && (
                <>
                    {/* Child Info Card */}
                    <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                                {selectedChild.avatar ? (
                                    <img src={selectedChild.avatar} alt={selectedChild.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    '👤'
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black mb-1">{selectedChild.name}</h2>
                                <p className="text-white/80">Grade {selectedChild.grade} • Class {selectedChild.class}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                                        {childStats.attendanceRate.toFixed(0)}%
                                    </p>
                                </div>
                                <Icon name="ClockIcon" className="w-8 h-8 text-green-500" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Grade</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                                        {childStats.averageGrade.toFixed(1)}%
                                    </p>
                                </div>
                                <Icon name="AcademicCapIcon" className="w-8 h-8 text-blue-500" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Assignments</p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                                        {childStats.upcomingAssignments}
                                    </p>
                                </div>
                                <Icon name="DocumentTextIcon" className="w-8 h-8 text-orange-500" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                                        {childStats.unreadMessages}
                                    </p>
                                </div>
                                <Icon name="EnvelopeIcon" className="w-8 h-8 text-purple-500" />
                            </div>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card className="p-6">
                        <WidgetErrorBoundary title="Recent Activity">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                            <div className="space-y-3">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity: any) => (
                                        <div key={activity.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {activity.expand?.assignment?.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {activity.expand?.assignment?.expand?.subject?.name}
                                                    </p>
                                                </div>
                                                {activity.grade && (
                                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                        {activity.grade}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-4 text-gray-500">No recent activity</p>
                                )}
                            </div>
                        </WidgetErrorBoundary>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link to="/parent/academic">
                                <Button variant="outline" className="w-full">
                                    <Icon name="AcademicCapIcon" className="w-5 h-5 mr-2" />
                                    Academics
                                </Button>
                            </Link>
                            <Link to="/parent/finance">
                                <Button variant="outline" className="w-full">
                                    <Icon name="CurrencyDollarIcon" className="w-5 h-5 mr-2" />
                                    Fees
                                </Button>
                            </Link>
                            <Link to="/parent/communication">
                                <Button variant="outline" className="w-full">
                                    <Icon name="ChatBubbleLeftRightIcon" className="w-5 h-5 mr-2" />
                                    Messages
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full">
                                <Icon name="CalendarIcon" className="w-5 h-5 mr-2" />
                                Schedule
                            </Button>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default ParentDashboard;
