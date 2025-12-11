import React, { useState, useEffect } from 'react';
import { Card, Button, Icon } from '../../components/shared/ui/CommonUI';
import { WidgetErrorBoundary } from '../../components/shared/ui/WidgetErrorBoundary';
import { Skeleton, SkeletonCard } from '../../components/shared/ui/Skeleton';
import { useApiError } from '../../hooks/useApiError';
import { useAuth } from '../../context/AuthContext';
import pb from '../../lib/pocketbase';
import { Link } from 'react-router-dom';

export const IndividualDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeProjects: 0,
        completedCourses: 0,
        skillsLearned: 0,
        achievementPoints: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const { handleError } = useApiError();

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const userId = pb.authStore.model?.id;
            
            // Fetch Courses
            const courses = await pb.collection('individual_courses').getList(1, 100, {
                filter: `user = "${userId}"`
            });
            const completedCourses = courses.items.filter(c => c.status === 'completed').length;
            
            // Fetch Goals
            const goalsData = await pb.collection('individual_goals').getList(1, 3, {
                filter: `user = "${userId}" && is_completed = false`,
                sort: 'due_date'
            });

            // Fetch Projects (assuming 'projects' collection exists, otherwise use 0)
            let activeProjects = 0;
            try {
                const projects = await pb.collection('projects').getList(1, 1, {
                    filter: `owner = "${userId}" && status = "active"`
                });
                activeProjects = projects.totalItems;
            } catch (e) {
                console.warn('Projects collection not found or empty');
            }

            setStats({
                activeProjects: activeProjects,
                completedCourses: completedCourses,
                skillsLearned: completedCourses * 2, // Estimate: 2 skills per course
                achievementPoints: completedCourses * 100 + activeProjects * 50
            });

            // Derive recent activity from courses and goals
            const recentActivityData = [
                ...courses.items.slice(0, 2).map(c => ({
                    id: c.id,
                    type: 'course',
                    title: `${c.status === 'completed' ? 'Completed' : 'Enrolled in'}: ${c.course_title}`,
                    date: new Date(c.updated)
                })),
                ...goalsData.items.slice(0, 1).map(g => ({
                    id: g.id,
                    type: 'goal',
                    title: `Goal: ${g.goal_text}`,
                    date: new Date(g.created)
                }))
            ].sort((a, b) => b.date.getTime() - a.date.getTime());

            setRecentActivity(recentActivityData);

            setGoals(goalsData.items.map(g => ({
                id: g.id,
                title: g.goal_text,
                progress: 0, // Goals don't have progress in schema yet
                deadline: g.due_date
            })));

        } catch (error) {
            handleError(error, 'Failed to load dashboard');
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
                    Welcome back, {user?.name}! 🚀
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Continue your learning journey
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 dark:text-purple-300 font-semibold">Active Projects</p>
                            <p className="text-3xl font-black text-purple-900 dark:text-white mt-2">{stats.activeProjects}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <Icon name="FolderOpenIcon" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">Completed Courses</p>
                            <p className="text-3xl font-black text-blue-900 dark:text-white mt-2">{stats.completedCourses}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <Icon name="AcademicCapIcon" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-300 font-semibold">Skills Learned</p>
                            <p className="text-3xl font-black text-green-900 dark:text-white mt-2">{stats.skillsLearned}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <Icon name="LightBulbIcon" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 dark:text-orange-300 font-semibold">Achievement Points</p>
                            <p className="text-3xl font-black text-orange-900 dark:text-white mt-2">{stats.achievementPoints}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                            <Icon name="TrophyIcon" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Goals */}
                <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Goals</h2>
                        <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    <div className="space-y-4">
                        {goals.map(goal => (
                            <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                        {goal.progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                                        style={{ width: `${goal.progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>

            {/* Recent Activity */}
            <Card className="p-6">
                <WidgetErrorBoundary title="Recent Activity">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {activity.date.toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </WidgetErrorBoundary>
            </Card>
        </div>

            {/* Continue Learning Section */ }
    <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="CodeBracketIcon" className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Web Development</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">65% Complete</p>
                <Button variant="primary" size="sm" className="w-full">Continue</Button>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="PaintBrushIcon" className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">UI/UX Design</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">40% Complete</p>
                <Button variant="primary" size="sm" className="w-full">Continue</Button>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="ChartBarIcon" className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Data Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">25% Complete</p>
                <Button variant="primary" size="sm" className="w-full">Continue</Button>
            </div>
        </div>
    </Card>

    {/* Quick Actions */ }
    <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/individual/learning">
                <Button variant="outline" className="w-full">
                    <Icon name="BookOpenIcon" className="w-5 h-5 mr-2" />
                    My Courses
                </Button>
            </Link>
            <Button variant="outline" className="w-full">
                <Icon name="FolderOpenIcon" className="w-5 h-5 mr-2" />
                Projects
            </Button>
            <Button variant="outline" className="w-full">
                <Icon name="TrophyIcon" className="w-5 h-5 mr-2" />
                Achievements
            </Button>
            <Link to="/individual/marketplace">
                <Button variant="outline" className="w-full">
                    <Icon name="ShoppingCartIcon" className="w-5 h-5 mr-2" />
                    Marketplace
                </Button>
            </Link>
        </div>
    </Card>
        </div >
    );
};

export default IndividualDashboard;
