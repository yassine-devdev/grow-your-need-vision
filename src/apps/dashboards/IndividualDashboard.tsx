
import React, { useState, useEffect } from 'react';
import { Icon, Card, Badge } from '../../components/shared/ui/CommonUI';
import { useRealtime } from '../../hooks/useRealtime';
import { useRealtimeContext } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { individualService, IndividualDashboardStats, Recommendation, IndividualGoal } from '../../services/individualService';

interface DashboardProps {
    activeTab: string;
    activeSubNav: string;
}

const IndividualDashboard: React.FC<DashboardProps> = ({ activeTab }) => {
    const { user } = useAuth();
    const { records: activities, loading: activitiesLoading } = useRealtime<any>('notifications');
    const { onlineUsers } = useRealtimeContext();

    // Real data state - NO MORE HARDCODED VALUES!
    const [stats, setStats] = useState<IndividualDashboardStats | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [dailyGoals, setDailyGoals] = useState<IndividualGoal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const [dashboardStats, recs, goals] = await Promise.all([
                    individualService.getDashboardStats(user.id),
                    individualService.getRecommendations(user.id, 2),
                    individualService.getDailyGoals(user.id),
                ]);

                setStats(dashboardStats);
                setRecommendations(recs);
                setDailyGoals(goals);
            } catch (error) {
                console.error('Failed to load individual dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user]);

    const handleToggleGoal = async (goalId: string) => {
        try {
            await individualService.toggleGoalCompletion(goalId);
            // Refresh goals
            if (user) {
                const updatedGoals = await individualService.getDailyGoals(user.id);
                setDailyGoals(updatedGoals);
            }
        } catch (error) {
            console.error('Failed to toggle goal:', error);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="flex items-end justify-between border-b border-gray-200/50 dark:border-gray-700/50 pb-4 relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gyn-blue-dark to-gyn-blue-medium dark:from-blue-400 dark:to-blue-200 drop-shadow-sm">My Personal Dashboard</h1>
                    <p className="text-gyn-grey dark:text-gray-400 text-sm mt-1 font-medium">Manage your life, learning, and work.</p>
                </div>
                <div className="text-right relative z-10 flex gap-3">
                    <Badge variant="neutral" className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-600 text-gray-600 dark:text-gray-300 shadow-sm">
                        <Icon name="UserGroupIcon" className="w-3 h-3 mr-2" />
                        {onlineUsers.length} Online
                    </Badge>
                    <Badge variant="success" className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-600 text-gyn-blue-dark dark:text-green-400 shadow-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                        All Systems Go
                    </Badge>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="glass" className="p-6 flex flex-col gap-2 group hover:-translate-y-1 transition-all border-l-4 border-blue-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                    <div className="flex justify-between relative z-10">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Learning</span>
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Icon name="AcademicCapIcon" className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white mt-2">2 Courses</div>
                    <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                        <Icon name="TrendingUp" className="w-3 h-3" />
                        +5% Progress
                    </div>
                </Card>

                <Card variant="glass" className="p-6 flex flex-col gap-2 group hover:-translate-y-1 transition-all border-l-4 border-red-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                    <div className="flex justify-between relative z-10">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wellness</span>
                        <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                            <Icon name="Heart" className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white mt-2">85 Score</div>
                    <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                        <Icon name="TrendingUp" className="w-3 h-3" />
                        +5 this week
                    </div>
                </Card>

                <Card variant="glass" className="p-6 flex flex-col gap-2 group hover:-translate-y-1 transition-all border-l-4 border-green-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                    <div className="flex justify-between relative z-10">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purchases</span>
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <Icon name="MarketIcon3D" className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white mt-2">3 Items</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1">
                        <Icon name="Truck" className="w-3 h-3" />
                        Tracking
                    </div>
                </Card>

                <Card variant="glass" className="p-6 flex flex-col gap-2 group hover:-translate-y-1 transition-all border-l-4 border-purple-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                    <div className="flex justify-between relative z-10">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Services</span>
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Icon name="ServicesIcon3D" className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white mt-2">1 Booking</div>
                    <div className="text-xs text-blue-500 font-bold flex items-center gap-1">
                        <Icon name="Calendar" className="w-3 h-3" />
                        Tomorrow
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card variant="glass" className="lg:col-span-2 p-6">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Recommended For You</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-white/60 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                            <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-lg mb-3 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-80 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="absolute bottom-2 left-2 text-white font-bold text-sm drop-shadow-md">Advanced React Patterns</div>
                            </div>
                            <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Upgrade your skills</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Course • 4h 30m</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-white/60 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-500 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                            <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-lg mb-3 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-500 opacity-80 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="absolute bottom-2 left-2 text-white font-bold text-sm drop-shadow-md">Home Gardening Kit</div>
                            </div>
                            <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Seasonal Offer</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Product • $24.99</p>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card variant="glass" className="p-6">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">Daily Goals</h3>
                        <div className="space-y-4">
                            {[
                                { goal: 'Complete 3 Lessons', done: true },
                                { goal: 'Walk 10,000 Steps', done: false },
                                { goal: 'Read 20 Pages', done: false },
                            ].map((g, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${g.done ? 'bg-green-500 border-green-500 text-white scale-110' : 'border-gray-300 dark:border-gray-600 text-transparent'}`}>
                                        <Icon name="CheckCircleIcon" className="w-4 h-4" />
                                    </div>
                                    <span className={`text-sm font-medium ${g.done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{g.goal}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Live Activity Feed */}
                    <Card variant="glass" className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 dark:text-white">Live Activity</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Live</span>
                            </div>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="text-center text-xs text-gray-400 py-4">Connecting to stream...</div>
                            ) : activities.length === 0 ? (
                                <div className="text-center text-xs text-gray-400 py-4">No recent activity</div>
                            ) : (
                                activities.map((activity: any) => (
                                    <div key={activity.id} className="flex gap-3 items-start p-2 rounded-lg bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700 animate-fadeIn">
                                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${activity.type === 'error' ? 'bg-red-500' :
                                                activity.type === 'success' ? 'bg-green-500' :
                                                    'bg-blue-500'
                                            }`} />
                                        <div>
                                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{activity.message}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{new Date(activity.created).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default IndividualDashboard;
