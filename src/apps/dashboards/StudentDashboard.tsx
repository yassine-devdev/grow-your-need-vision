
import React, { useState, useEffect } from 'react';
import { Icon, Card, Badge } from '../../components/shared/ui/CommonUI';
import { useAuth } from '../../context/AuthContext';
import { assignmentService, AssignmentRecord } from '../../services/assignmentService';
import { courseService, Course } from '../../services/courseService';
import { academicsService } from '../../services/academicsService';
import { attendanceService } from '../../services/attendanceService';
import { studentAcademicsService } from '../../services/studentAcademicsService';
import StudentSchedule from '../student/Schedule';
import { AIContentGeneratorModal } from '../../components/shared/modals/AIContentGeneratorModal';

interface DashboardProps {
    activeTab: string;
    activeSubNav: string;
}

const StudentDashboard: React.FC<DashboardProps> = ({ activeTab, activeSubNav }) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [gpa, setGpa] = useState<string>('--');
    const [attendanceRate, setAttendanceRate] = useState<string>('--%');
    const [loading, setLoading] = useState(true);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const [assData, courseData, gradesData, attendanceData, academicSummary] = await Promise.all([
                    assignmentService.getStudentAssignments(user.id),
                    courseService.getStudentCourses(user.id),
                    academicsService.getStudentGrades(user.id),
                    attendanceService.getStudentAttendance(user.id),
                    studentAcademicsService.getAcademicsSummary(user.id)
                ]);
                setAssignments(assData);
                setCourses(courseData);

                // Calculate GPA
                if (academicSummary.gpa > 0) {
                    setGpa(academicSummary.gpa.toFixed(2));
                } else if (gradesData.length > 0) {
                    // Fallback to simple average if GPA service returns 0 (e.g. no weights)
                    const total = gradesData.reduce((sum, g) => sum + (g.marks_obtained || 0), 0);
                    const avg = total / gradesData.length;
                    // Convert to 4.0 scale roughly (assuming 100 is max)
                    const gpaVal = (avg / 25).toFixed(1);
                    setGpa(gpaVal);
                }

                // Calculate Attendance
                if (attendanceData.items.length > 0) {
                    const total = attendanceData.items.length;
                    const present = attendanceData.items.filter(a => a.status === 'Present').length;
                    const rate = Math.round((present / total) * 100);
                    setAttendanceRate(`${rate}%`);
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Filter upcoming assignments (due in future)
    const upcomingAssignments = assignments
        .filter(a => new Date(a.due_date) > new Date())
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    const getDueLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'TODAY';
        if (diffDays === 1) return 'TOMORROW';
        if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    };

    const getDueColor = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) return 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
        if (diffDays <= 3) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
        return 'bg-hud-primary/10 text-hud-primary border-hud-primary/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]';
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
                {/* Assignments - Holographic Panel */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-material-gunmetal/80 backdrop-blur-2xl rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 group-hover:border-hud-primary/30">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-hud-primary/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>

                        <div className="relative p-6 z-10">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-hud-primary/10 rounded border border-hud-primary/30 text-hud-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                                        <Icon name="DocumentTextIcon" className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-white text-lg uppercase tracking-widest">Mission Objectives</h3>
                                </div>
                                <button
                                    onClick={() => setIsAIModalOpen(true)}
                                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded border border-purple-500/30 uppercase tracking-wider hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                >
                                    <Icon name="Sparkles" className="w-3 h-3" /> AI Strategy
                                </button>
                            </div>

                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center text-gray-500 py-8 font-mono text-xs animate-pulse">INITIALIZING DATA STREAM...</div>
                                ) : upcomingAssignments.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8 bg-black/20 rounded-xl border border-dashed border-white/10">
                                        <p className="font-mono text-xs uppercase">ALL OBJECTIVES COMPLETE</p>
                                        <p className="text-[10px] mt-1 opacity-60">Standby for new orders.</p>
                                    </div>
                                ) : (
                                    upcomingAssignments.slice(0, 3).map((a, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-hud-primary/30 hover:bg-white/5 transition-all group/item cursor-pointer relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-hud-primary opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-1 h-8 rounded-full ${getDueColor(a.due_date).split(' ')[0].replace('/10', '')} shadow-[0_0_8px_currentColor]`}></div>
                                                <div>
                                                    <div className="font-bold text-gray-200 group-hover/item:text-white transition-colors uppercase tracking-wide text-sm">{a.title}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center gap-2">
                                                        <Icon name="ClockIcon" className="w-3 h-3" />
                                                        DEADLINE: {new Date(a.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded text-[10px] font-black border uppercase tracking-wider ${getDueColor(a.due_date)}`}>{getDueLabel(a.due_date)}</span>
                                        </div>
                                    )))}
                            </div>

                            <div className="mt-6 text-center">
                                <button className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 rounded transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                    View Full Mission Log <Icon name="ArrowRight" className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses - Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {loading ? (
                        <div className="col-span-2 text-center text-gray-500 font-mono text-xs">LOADING MODULES...</div>
                    ) : courses.length === 0 ? (
                        <div className="col-span-2 text-center text-gray-500 font-mono text-xs">NO MODULES ENROLLED</div>
                    ) : (
                        courses.slice(0, 4).map((c, i) => (
                            <div key={i} className="relative group overflow-hidden rounded-xl bg-material-gunmetal/60 border border-white/10 hover:border-hud-primary/50 transition-all cursor-pointer h-32">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative p-4 h-full flex flex-col justify-between z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="w-8 h-8 rounded bg-hud-primary/10 flex items-center justify-center text-hud-primary border border-hud-primary/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                                            <Icon name="Book" className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-500">{c.grade || 'N/A'}</span>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-white truncate uppercase tracking-wide text-xs mb-2">{c.title}</h4>
                                        <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-hud-primary rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)] relative" style={{ width: `${c.progress}%` }}>
                                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )))}
                </div>
            </div>

            <div className="space-y-8">
                {/* GPA Card - Power Level */}
                <div className="relative group rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-material-gunmetal border border-white/10 shadow-[0_0_40px_rgba(79,70,229,0.2)]"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

                    {/* Animated Rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-dashed border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

                    <div className="relative p-8 text-center z-10">
                        <div className="mb-2">
                            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-widest border border-purple-500/30 px-2 py-1 rounded bg-purple-500/10">Performance Index</span>
                        </div>
                        <div className="text-7xl font-black text-white mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] tracking-tighter font-mono">{gpa}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Current GPA</div>

                        <div className="mt-8 space-y-4 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                            <div className="flex justify-between text-[10px] font-bold items-center uppercase tracking-wider">
                                <span className="text-gray-400">Attendance Rate</span>
                                <span className="text-emerald-400">{attendanceRate}</span>
                            </div>
                            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] relative" style={{ width: attendanceRate !== '--%' ? attendanceRate : '0%' }}>
                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notices - System Alerts */}
                <div className="relative group rounded-xl overflow-hidden bg-material-gunmetal/60 border border-white/10 backdrop-blur-xl">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-2">
                        <Icon name="BellIcon" className="w-4 h-4 text-hud-primary animate-pulse" />
                        <h3 className="font-black text-white text-xs uppercase tracking-widest">System Broadcasts</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="text-center py-4">
                            <p className="text-xs text-gray-500 font-mono">NO NEW BROADCASTS</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDueDates = () => (
        <div className="space-y-6">
            <div className="relative group bg-material-gunmetal/80 backdrop-blur-2xl rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <Icon name="CalendarIcon" className="w-5 h-5 text-hud-primary" />
                    <h3 className="font-black text-lg text-white uppercase tracking-widest">Tactical Timeline</h3>
                </div>
                <div className="space-y-4">
                    {upcomingAssignments.map((a, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-hud-primary/30 transition-all group/row">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded flex items-center justify-center ${getDueColor(a.due_date).replace('border', '')} bg-opacity-20`}>
                                    <Icon name="CalendarIcon" className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-200 group-hover/row:text-white uppercase tracking-wide text-sm">{a.title}</h4>
                                    <p className="text-[10px] text-gray-500 font-mono mt-1">{new Date(a.due_date).toLocaleDateString()} • {a.points} PTS</p>
                                </div>
                            </div>
                            <Badge variant={getDueLabel(a.due_date) === 'OVERDUE' ? 'danger' : 'warning'} className="uppercase tracking-wider text-[10px]">
                                {getDueLabel(a.due_date)}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-10">
            {/* Page Header - Cinematic */}
            <div className="flex items-end justify-between border-b border-white/10 pb-6 relative">
                <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-hud-primary to-transparent"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-hud-primary to-white drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] tracking-tight uppercase">Student Portal</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-hud-primary/10 border border-hud-primary/30 text-[10px] font-mono text-hud-primary uppercase tracking-widest">ID: {user?.id?.substring(0, 8) || 'UNKNOWN'}</span>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest opacity-80" data-testid="welcome-msg">Welcome back, {user?.name || 'Student'}</p>
                    </div>
                </div>
                <div className="text-right relative z-10">
                    <Badge variant="neutral" className="bg-black/40 backdrop-blur-md border border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] px-4 py-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-2 shadow-[0_0_10px_rgba(168,85,247,1)]"></span>
                        <span className="font-mono tracking-widest text-xs">LINK ESTABLISHED</span>
                    </Badge>
                </div>
            </div>

            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Timetable' && <StudentSchedule activeTab={activeTab} activeSubNav={activeSubNav} />}
            {activeTab === 'Due Dates' && renderDueDates()}
            {!['Overview', 'Timetable', 'Due Dates'].includes(activeTab) && renderOverview()}

            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={() => setIsAIModalOpen(false)}
                title="Generate Study Plan"
                promptTemplate={`Create a study plan for today based on my upcoming assignments:
        ${upcomingAssignments.map(a => `- ${a.title} (Due: ${new Date(a.due_date).toLocaleDateString()})`).join('\n')}
        
        Prioritize urgent tasks and suggest break times.`}
                contextData={{ assignments: upcomingAssignments }}
            />
        </div>
    );
};

export default StudentDashboard;
