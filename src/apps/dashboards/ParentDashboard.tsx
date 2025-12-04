
import React, { useState, useEffect } from 'react';
import { Icon, Card, Badge, Button } from '../../components/shared/ui/CommonUI';
import pb from '../../lib/pocketbase';
import { parentService } from '../../services/parentService';
import { academicsService } from '../../services/academicsService';
import { attendanceService } from '../../services/attendanceService';

interface DashboardProps {
  activeTab: string;
}

const ParentDashboard: React.FC<DashboardProps> = ({ activeTab }) => {
  const [children, setChildren] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, { avgGrade: string, attendance: string, recentUpdate: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = pb.authStore.model;
        if (user) {
          const kids = await parentService.getChildren(user.id);
          setChildren(kids);

          const newStats: Record<string, any> = {};
          for (const kid of kids) {
              // Grades
              const grades = await academicsService.getStudentGrades(kid.id);
              const avgGrade = grades.length > 0 
                  ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) 
                  : '--';

              // Attendance
              const attendance = await attendanceService.getStudentAttendance(kid.id);
              const total = attendance.items.length;
              const present = attendance.items.filter(a => a.status === 'Present').length;
              const attendanceRate = total > 0 ? Math.round((present / total) * 100) + '%' : '--%';

              // Recent Update
              let recentUpdate = 'Account Linked Successfully';
              if (grades.length > 0) {
                  const latest = grades[grades.length - 1]; 
                  recentUpdate = `New Grade: ${latest.grade} in ${latest.expand?.exam?.expand?.subject?.name || 'Subject'}`;
              } else if (attendance.items.length > 0) {
                  recentUpdate = `Attendance Marked: ${attendance.items[0].status}`;
              }

              newStats[kid.id] = { avgGrade, attendance: attendanceRate, recentUpdate };
          }
          setStats(newStats);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
      <div className="flex justify-center items-center h-96">
          <div className="relative">
              <div className="w-16 h-16 border-4 border-hud-primary/30 border-t-hud-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-hud-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,240,255,1)]"></div>
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
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-hud-primary to-white drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] tracking-tight uppercase">Guardian Portal</h1>
          <div className="flex items-center gap-2 mt-2">
             <span className="px-2 py-0.5 rounded bg-hud-primary/10 border border-hud-primary/30 text-[10px] font-mono text-hud-primary uppercase tracking-widest">SECURE LINK</span>
             <p className="text-gray-400 text-sm font-medium uppercase tracking-widest opacity-80">
                 Monitoring: {children.map(c => c.name).join(', ') || 'NO SUBJECTS LINKED'}
             </p>
          </div>
        </div>
        <div className="text-right relative z-10">
             <Badge variant="success" className="bg-black/40 backdrop-blur-md border border-hud-primary/50 text-hud-primary shadow-[0_0_15px_rgba(0,240,255,0.3)] px-4 py-2">
                <span className="w-2 h-2 bg-hud-primary rounded-full animate-pulse mr-2 shadow-[0_0_10px_rgba(0,240,255,1)]"></span>
                <span className="font-mono tracking-widest text-xs">UPDATES AVAILABLE</span>
             </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {children.map((child, index) => (
              <div key={child.id} className="relative group">
                  {/* Holographic Card Container */}
                  <div className="absolute inset-0 bg-material-gunmetal/80 backdrop-blur-2xl rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 group-hover:border-hud-primary/30 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]"></div>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                      {/* Card Header */}
                      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black/40 to-transparent relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                              <Icon name="AcademicCapIcon" className="w-32 h-32 text-white transform rotate-12 translate-x-8 -translate-y-8" />
                          </div>
                          
                          <div className="flex justify-between items-start relative z-10">
                              <div className="flex items-center gap-5">
                                  <div className="w-16 h-16 bg-black/40 rounded-xl flex items-center justify-center text-white shadow-lg font-black text-2xl border border-white/10 group-hover:border-hud-primary/50 transition-colors relative overflow-hidden">
                                      <div className="absolute inset-0 bg-hud-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                      {child.name[0]}
                                  </div>
                                  <div>
                                      <h3 className="font-black text-2xl text-white tracking-tight uppercase">{child.name}</h3>
                                      <p className="text-xs text-hud-primary font-mono flex items-center gap-2 mt-1">
                                          <Icon name="IdentificationIcon" className="w-3 h-3 opacity-70" />
                                          ID: #{child.id.substring(0, 6).toUpperCase()}
                                      </p>
                                  </div>
                              </div>
                              <Badge variant="success" className="bg-hud-primary/10 text-hud-primary border border-hud-primary/30 font-mono text-[10px] uppercase tracking-wider">Active</Badge>
                          </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="p-6 grid grid-cols-2 gap-4">
                          <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center group-hover:border-hud-primary/30 transition-colors relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hud-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="text-3xl font-black text-white mb-1 font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                  {stats[child.id]?.avgGrade || '--'}
                              </div>
                              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Avg Grade</div>
                          </div>
                          <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center group-hover:border-purple-500/30 transition-colors relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="text-3xl font-black text-white mb-1 font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                  {stats[child.id]?.attendance || '--%'}
                              </div>
                              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Attendance</div>
                          </div>
                      </div>

                      {/* Recent Updates Section */}
                      <div className="px-6 pb-6 flex-1 flex flex-col justify-end">
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                              <Icon name="ClockIcon" className="w-4 h-4 text-hud-primary" />
                              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Latest Intel</h4>
                          </div>
                          <div className="space-y-3">
                              <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-black/20 border border-white/5 hover:border-hud-primary/30 hover:bg-white/5 transition-all cursor-pointer group/item">
                                  <div className="p-1.5 bg-hud-primary/10 rounded-full text-hud-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                                    <Icon name="CheckCircleIcon" className="w-4 h-4" />
                                  </div>
                                  <span className="text-gray-300 font-mono text-xs group-hover/item:text-white transition-colors">
                                      {stats[child.id]?.recentUpdate || 'Account Linked Successfully'}
                                  </span>
                              </div>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                              <Button variant="ghost" size="sm" className="text-hud-primary hover:text-white hover:bg-hud-primary/10 uppercase tracking-wider text-[10px]" rightIcon={<Icon name="ArrowRight" className="w-4 h-4" />}>Full Dossier</Button>
                          </div>
                      </div>
                  </div>
              </div>
          ))}
          
          {children.length === 0 && (
              <div className="col-span-2 p-12 text-center bg-black/20 rounded-2xl border border-dashed border-white/10 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="UserGroup" className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-2">No Subjects Linked</h3>
                  <p className="text-gray-600 font-mono text-xs">Contact administration to establish link.</p>
              </div>
          )}
      </div>

      <div className="relative group rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-material-gunmetal/60 backdrop-blur-xl border border-white/10"></div>
          <div className="relative p-6 flex justify-between items-center z-10">
              <div className="w-full max-w-md">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-hud-primary/10 rounded border border-hud-primary/30 text-hud-primary">
                          <Icon name="CurrencyDollarIcon" className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-widest">Financial Status</h3>
                  </div>
                  <p className="text-xs text-gray-500 font-mono px-1">Check Finance tab for detailed transaction logs.</p>
              </div>
              <Button variant="glow" className="ml-4 uppercase tracking-wider text-xs">Access Finance</Button>
          </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
