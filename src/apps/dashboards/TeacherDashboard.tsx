
import React, { useState, useEffect } from 'react';
import { Icon, Card, Badge, Button } from '../../components/shared/ui/CommonUI';
import { Spinner } from '../../components/shared/ui/Spinner';
import pb from '../../lib/pocketbase';
import { academicsService } from '../../services/academicsService';
import { assignmentService, AssignmentRecord } from '../../services/assignmentService';
import { SchoolClass } from '../../apps/school/types';
import { AssignmentModal } from '../../components/shared/modals/AssignmentModal';
import { AIContentGeneratorModal } from '../../components/shared/modals/AIContentGeneratorModal';

interface DashboardProps {
    activeTab: string;
    activeSubNav: string;
}

const TeacherDashboard: React.FC<DashboardProps> = ({ activeTab }) => {
    const user = pb.authStore.model;
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [recentAssignments, setRecentAssignments] = useState<AssignmentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch Classes
                const classesData = await academicsService.getTeacherClasses(user.id);
                setClasses(classesData);

                // Fetch Recent Assignments
                const assignmentsData = await assignmentService.getAssignments(user.id, 1, 5);
                setRecentAssignments(assignmentsData.items);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user]);

    const handleAssignmentCreated = async () => {
        if (!user) return;
        // Refresh assignments
        const assignmentsData = await assignmentService.getAssignments(user.id, 1, 5);
        setRecentAssignments(assignmentsData.items);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-hud-primary/30 border-t-hud-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-hud-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,240,255,1)]"></div>
                    </div>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (activeTab === 'Schedule') {
            return (
                <div className="relative group animate-fadeIn">
                    <div className="absolute inset-0 bg-material-gunmetal/90 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"></div>
                    <div className="relative p-8 text-center z-10">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-hud-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-hud-primary/20 shadow-[0_0_20px_rgba(0,240,255,0.1)] relative">
                                <div className="absolute inset-0 rounded-full border border-hud-primary/30 animate-ping opacity-20"></div>
                                <Icon name="Calendar" className="w-10 h-10 text-hud-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
                            </div>
                            <div className="bg-gradient-to-r from-material-obsidian to-material-gunmetal p-4 rounded-lg mb-6 border border-white/10 shadow-lg">
                                <h3 className="text-xl font-black text-white uppercase tracking-widest">Class Schedule</h3>
                                <div className="h-[1px] w-20 bg-hud-primary mx-auto mt-2 shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                            </div>
                            
                            {classes.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-black/20">
                                    <p className="text-gray-500 font-mono text-sm">NO CLASSES SCHEDULED</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 text-left">
                                    {classes.map(cls => (
                                        <div key={cls.id} className="p-4 bg-black/20 border border-white/5 hover:border-hud-primary/50 rounded-xl flex justify-between items-center transition-all group/item hover:bg-white/5">
                                            <div>
                                                <div className="font-bold text-white group-hover/item:text-hud-primary transition-colors uppercase tracking-wide">{cls.name}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-2">
                                                    <Icon name="LocationMarker" className="w-3 h-3" />
                                                    {cls.room || 'VIRTUAL_ROOM'}
                                                </div>
                                            </div>
                                            <Badge variant="neutral" className="bg-white/5 border-white/10 text-gray-300 font-mono">
                                                {cls.schedule ? cls.schedule : 'TBA'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'Tasks') {
            return (
                <div className="relative group animate-fadeIn">
                    <div className="absolute inset-0 bg-material-gunmetal/90 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"></div>
                    <div className="relative p-6 z-10">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Icon name="ClipboardDocumentCheckIcon" className="w-6 h-6 text-hud-primary animate-pulse" />
                                <h3 className="font-black text-xl text-white uppercase tracking-widest">Mission Log</h3>
                            </div>
                            <Button variant="glow" size="sm" leftIcon={<Icon name="Plus" className="w-4 h-4" />}>New Task</Button>
                        </div>
                        <div className="space-y-3">
                            {recentAssignments.filter(a => new Date(a.due_date) > new Date()).length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-black/20">
                                    <p className="text-gray-500 font-mono text-sm">NO PENDING TASKS</p>
                                </div>
                            ) : (
                                recentAssignments.filter(a => new Date(a.due_date) > new Date()).map(a => (
                                    <div key={a.id} className="flex items-center gap-4 p-4 bg-black/20 hover:bg-hud-primary/10 rounded-xl transition-all cursor-pointer border border-white/5 hover:border-hud-primary/30 group/task">
                                        <div className="w-2 h-2 rounded-full bg-hud-primary shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover/task:text-hud-primary transition-colors uppercase tracking-wide">{a.title}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-1">DEADLINE: {new Date(a.due_date).toLocaleDateString()}</div>
                                        </div>
                                        <Badge variant="warning" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-mono uppercase text-[10px]">Pending</Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Overview
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Classes Card - Holographic */}
                <div className="relative group h-full min-h-[300px]">
                    <div className="absolute inset-0 bg-material-gunmetal/80 backdrop-blur-2xl rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 group-hover:border-hud-primary/30">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-hud-primary/20 blur-[60px] rounded-full -mr-10 -mt-10"></div>
                        
                        <div className="relative p-6 z-10 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-hud-primary/10 rounded border border-hud-primary/30 text-hud-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                                    <Icon name="AcademicCapIcon" className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Classes</h3>
                            </div>
                            
                            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {classes.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl bg-black/20">
                                        <p className="text-gray-500 font-mono text-xs">NO CLASS DATA FOUND</p>
                                    </div>
                                ) : (
                                    classes.map((cls, idx) => (
                                        <div key={cls.id} className="relative p-4 bg-black/20 border border-white/5 hover:border-hud-primary/50 rounded-xl transition-all cursor-pointer group/item hover:bg-white/5 overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-hud-primary opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg border border-white/10 ${
                                                    idx % 3 === 0 ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' :
                                                    idx % 3 === 1 ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' :
                                                    'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                                                }`}>
                                                    {cls.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-gray-200 group-hover/item:text-white truncate uppercase tracking-wide text-sm">{cls.name}</div>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-1">
                                                        <Icon name="LocationMarker" className="w-3 h-3" />
                                                        {cls.room || 'REMOTE'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Assignments Card - Glass Panel */}
                <div className="relative group h-full min-h-[300px]">
                    <div className="absolute inset-0 bg-material-gunmetal/80 backdrop-blur-2xl rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 group-hover:border-hud-primary/30">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
                        
                        <div className="relative p-6 z-10 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-500/10 rounded border border-orange-500/30 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                                    <Icon name="ClipboardDocumentCheckIcon" className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Ops</h3>
                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {recentAssignments.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl bg-black/20">
                                        <p className="text-gray-500 font-mono text-xs">NO ASSIGNMENTS LOGGED</p>
                                    </div>
                                ) : (
                                    recentAssignments.map((assignment) => {
                                        const isDueSoon = new Date(assignment.due_date) > new Date() &&
                                            new Date(assignment.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000;
                                        const isOverdue = new Date(assignment.due_date) < new Date();

                                        return (
                                            <div key={assignment.id} className="flex justify-between items-center p-3 border border-white/5 bg-black/20 rounded-lg hover:bg-white/5 hover:border-white/20 transition-all group/row">
                                                <div className="min-w-0 flex-1 mr-3">
                                                    <div className="text-xs font-bold text-gray-300 group-hover/row:text-white truncate uppercase tracking-wide">{assignment.title}</div>
                                                    <div className="text-[9px] text-gray-500 font-mono mt-0.5">{new Date(assignment.due_date).toLocaleDateString()}</div>
                                                </div>
                                                {isOverdue ? (
                                                    <span className="text-[9px] font-black px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">Closed</span>
                                                ) : isDueSoon ? (
                                                    <span className="text-[9px] font-black px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider">Due Soon</span>
                                                ) : (
                                                    <span className="text-[9px] font-black px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-wider">Active</span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Command Deck */}
                <div className="relative group overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-hud-primary/20 to-purple-900/40 backdrop-blur-xl border border-hud-primary/30 shadow-[0_0_30px_rgba(0,240,255,0.15)]"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                    
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>

                    <div className="relative p-6 z-10 h-full flex flex-col justify-center">
                        <h3 className="font-black text-xl text-white mb-6 uppercase tracking-widest text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Command Deck</h3>
                        
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => setIsAssignmentModalOpen(true)}
                                className="group/btn relative overflow-hidden p-4 rounded-xl border border-white/10 bg-black/20 hover:bg-hud-primary/10 hover:border-hud-primary/50 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg group-hover/btn:bg-hud-primary group-hover/btn:text-black transition-colors">
                                            <Icon name="PlusCircleIcon" className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-white uppercase tracking-wider">Assign Task</span>
                                    </div>
                                    <Icon name="ChevronRight" className="w-4 h-4 text-gray-500 group-hover/btn:text-hud-primary group-hover/btn:translate-x-1 transition-all" />
                                </div>
                            </button>

                            <button
                                onClick={() => setIsAIModalOpen(true)}
                                className="group/btn relative overflow-hidden p-4 rounded-xl border border-white/10 bg-black/20 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg group-hover/btn:bg-purple-500 group-hover/btn:text-white transition-colors">
                                            <Icon name="Sparkles" className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-white uppercase tracking-wider">AI Report</span>
                                    </div>
                                    <Icon name="ChevronRight" className="w-4 h-4 text-gray-500 group-hover/btn:text-purple-400 group-hover/btn:translate-x-1 transition-all" />
                                </div>
                            </button>

                            <button className="group/btn relative overflow-hidden p-4 rounded-xl border border-white/5 bg-black/10 opacity-50 cursor-not-allowed">
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            <Icon name="ChatBubbleLeftRight" className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Comms Link</span>
                                    </div>
                                    <Icon name="LockClosedIcon" className="w-3 h-3 text-gray-600" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-10">
            {/* Page Header - Cinematic */}
            <div className="flex items-end justify-between border-b border-white/10 pb-6 relative">
                <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-hud-primary to-transparent"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-hud-primary to-white drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] tracking-tight uppercase">Classroom Command</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-hud-primary/10 border border-hud-primary/30 text-[10px] font-mono text-hud-primary uppercase tracking-widest">ID: {user?.id?.substring(0, 8) || 'UNKNOWN'}</span>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest opacity-80">Welcome back, {user?.name || 'Teacher'}</p>
                    </div>
                </div>
                <div className="text-right relative z-10">
                    <Badge variant="info" className="bg-black/40 backdrop-blur-md border border-hud-primary/50 text-hud-primary shadow-[0_0_15px_rgba(0,240,255,0.3)] px-4 py-2">
                        <span className="w-2 h-2 bg-hud-primary rounded-full animate-pulse mr-2 shadow-[0_0_10px_rgba(0,240,255,1)]"></span>
                        <span className="font-mono tracking-widest text-xs">SESSION ACTIVE</span>
                    </Badge>
                </div>
            </div>

            {renderContent()}

            {/* Assignment Modal */}
            {user && (
                <AssignmentModal
                    isOpen={isAssignmentModalOpen}
                    onClose={() => setIsAssignmentModalOpen(false)}
                    onSuccess={handleAssignmentCreated}
                    teacherId={user.id}
                />
            )}

            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={() => setIsAIModalOpen(false)}
                title="Generate Class Report"
                promptTemplate={`Generate a summary report for my classes based on the following data:
        Courses: ${classes.map(c => c.name).join(', ')}
        Recent Assignments: ${recentAssignments.slice(0, 5).map(a => a.title).join(', ')}
        
        Include suggestions for improving student engagement.`}
                contextData={{ classes, recentAssignments }}
            />
        </div>
    );
};

export default TeacherDashboard;
