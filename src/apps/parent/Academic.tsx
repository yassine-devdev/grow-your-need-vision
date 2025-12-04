import React, { useState, useEffect } from 'react';
import pb from '../../lib/pocketbase';
import { parentService } from '../../services/parentService';
import { academicsService } from '../../services/academicsService';
import { attendanceService } from '../../services/attendanceService';
import { OwnerIcon } from '../../components/shared/OwnerIcons';
import { AIContentGeneratorModal } from '../../components/shared/modals/AIContentGeneratorModal';
import { Icon } from '../../components/shared/ui/CommonUI';

interface Props {
  activeTab: string;
  activeSubNav: string;
}

const ParentAcademic: React.FC<Props> = ({ activeTab, activeSubNav }) => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'grades' | 'attendance' | 'schedule'>('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (activeTab === 'Grades') setView('grades');
    else if (activeTab === 'Attendance') setView('attendance');
    else setView('overview');
  }, [activeTab]);

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild);
    }
  }, [selectedChild, view]);

  const loadChildren = async () => {
    try {
      const user = pb.authStore.model;
      if (user) {
        const kids = await parentService.getChildren(user.id);
        setChildren(kids);
        if (kids.length > 0) {
          setSelectedChild(kids[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (studentId: string) => {
    try {
      if (view === 'grades' || view === 'overview') {
        const g = await academicsService.getStudentGrades(studentId);
        setGrades(g);
      }
      
      if (view === 'attendance' || view === 'overview') {
        const a = await attendanceService.getStudentAttendance(studentId);
        setAttendance(a.items);
        
        // Calculate stats
        const present = a.items.filter((r: any) => r.status === 'Present').length;
        const total = a.items.length;
        setStats({
            rate: total > 0 ? Math.round((present / total) * 100) : 0,
            total,
            present
        });
      }

      if (view === 'schedule') {
        const s = await academicsService.getStudentClasses(studentId);
        setSchedule(s);
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (children.length === 0) {
    return (
        <div className="p-8 text-center bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50">
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Students Linked</h3>
            <p className="text-gray-500">Please contact the school administration to link your account to your children.</p>
        </div>
    );
  }

  const currentChild = children.find(c => c.id === selectedChild);

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/50 pb-4">
        <div>
            <h2 className="text-2xl font-black text-gyn-blue-dark">{activeTab}</h2>
            <p className="text-sm text-gray-500">Monitor your children's progress.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl border border-white/60">
            <button
                onClick={() => setIsAIModalOpen(true)}
                className="px-3 py-2 rounded-lg text-sm font-bold text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1"
                title="Generate AI Progress Report"
            >
                <Icon name="Sparkles" className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            {children.map(child => (
                <button
                    key={child.id}
                    onClick={() => setSelectedChild(child.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        selectedChild === child.id
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {child.name}
                </button>
            ))}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
          {['overview', 'grades', 'attendance', 'schedule'].map((v) => (
              <button
                  key={v}
                  onClick={() => setView(v as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                      view === v
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }`}
              >
                  {v}
              </button>
          ))}
      </div>
      
      {view === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Grades */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-glass-edge p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">Recent Grades</h3>
                  <div className="space-y-3">
                      {grades.slice(0, 5).map((grade: any) => (
                          <div key={grade.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/60">
                              <div>
                                  <span className="font-bold text-gray-700 block">{grade.expand?.exam?.expand?.subject?.name || 'Subject'}</span>
                                  <span className="text-xs text-gray-500">{grade.expand?.exam?.title}</span>
                              </div>
                              <div className="text-right">
                                  <span className="font-mono font-bold text-blue-600 block">{grade.score}/{grade.expand?.exam?.max_score}</span>
                                  <span className="text-xs font-bold text-gray-400">{grade.grade}</span>
                              </div>
                          </div>
                      ))}
                      {grades.length === 0 && <p className="text-gray-500 text-center py-4">No grades recorded yet.</p>}
                  </div>
              </div>

              {/* Attendance Summary */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-glass-edge p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">Attendance Overview</h3>
                  {stats && (
                      <div className="flex items-center justify-center py-6">
                          <div className="relative w-32 h-32 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                  <circle cx="64" cy="64" r="60" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                  <circle
                                      cx="64"
                                      cy="64"
                                      r="60"
                                      fill="none"
                                      stroke={stats.rate > 90 ? '#22c55e' : stats.rate > 75 ? '#eab308' : '#ef4444'}
                                      strokeWidth="8"
                                      strokeDasharray={`${(stats.rate / 100) * 377} 377`}
                                      strokeLinecap="round"
                                  />
                              </svg>
                              <div className="absolute text-center">
                                  <span className="text-3xl font-black text-gray-800">{stats.rate}%</span>
                                  <span className="block text-xs text-gray-500">Present</span>
                              </div>
                          </div>
                      </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 p-3 rounded-xl text-center">
                          <span className="block text-2xl font-bold text-green-600">{stats?.present || 0}</span>
                          <span className="text-xs text-green-800">Days Present</span>
                      </div>
                      <div className="bg-red-50 p-3 rounded-xl text-center">
                          <span className="block text-2xl font-bold text-red-600">{(stats?.total || 0) - (stats?.present || 0)}</span>
                          <span className="text-xs text-red-800">Days Absent</span>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {view === 'grades' && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-glass-edge p-6">
              <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead>
                          <tr className="text-left border-b border-gray-200">
                              <th className="pb-3 font-bold text-gray-600">Subject</th>
                              <th className="pb-3 font-bold text-gray-600">Exam</th>
                              <th className="pb-3 font-bold text-gray-600">Date</th>
                              <th className="pb-3 font-bold text-gray-600 text-right">Score</th>
                              <th className="pb-3 font-bold text-gray-600 text-right">Grade</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {grades.map((grade: any) => (
                              <tr key={grade.id} className="group hover:bg-white/50 transition-colors">
                                  <td className="py-3 font-medium text-gray-800">{grade.expand?.exam?.expand?.subject?.name}</td>
                                  <td className="py-3 text-gray-600">{grade.expand?.exam?.title}</td>
                                  <td className="py-3 text-gray-500 text-sm">
                                      {new Date(grade.expand?.exam?.date).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 text-right font-mono text-blue-600">
                                      {grade.score}/{grade.expand?.exam?.max_score}
                                  </td>
                                  <td className="py-3 text-right font-bold text-gray-800">{grade.grade}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {view === 'attendance' && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-glass-edge p-6">
              <div className="space-y-2">
                  {attendance.map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/60">
                          <div className="flex items-center gap-4">
                              <div className={`w-2 h-12 rounded-full ${
                                  record.status === 'Present' ? 'bg-green-500' :
                                  record.status === 'Absent' ? 'bg-red-500' :
                                  record.status === 'Late' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}></div>
                              <div>
                                  <span className="font-bold text-gray-800 block">
                                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                                  <span className="text-sm text-gray-500">{record.expand?.class?.name}</span>
                              </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              record.status === 'Present' ? 'bg-green-100 text-green-700' :
                              record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                              record.status === 'Late' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                              {record.status}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {view === 'schedule' && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-glass-edge p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedule.map((cls: any) => (
                      <div key={cls.id} className="p-4 bg-white/50 rounded-xl border border-white/60">
                          <h4 className="font-bold text-gray-800">{cls.expand?.subject?.name}</h4>
                          <p className="text-sm text-gray-500">{cls.day_of_week} • {cls.start_time} - {cls.end_time}</p>
                          <p className="text-xs text-blue-600 mt-2 font-medium">{cls.room}</p>
                      </div>
                  ))}
                  {schedule.length === 0 && <p className="col-span-full text-center text-gray-500">No classes scheduled.</p>}
              </div>
          </div>
      )}

      <AIContentGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccess={() => setIsAIModalOpen(false)}
        title={`Progress Report for ${currentChild?.name || 'Student'}`}
        promptTemplate={`Generate a comprehensive progress report for ${currentChild?.name} based on the following data:
        
        Grades:
        ${grades.map((g: any) => `- ${g.expand?.exam?.expand?.subject?.name}: ${g.score}/${g.expand?.exam?.max_score} (${g.grade})`).join('\n')}
        
        Attendance:
        - Present: ${stats?.present || 0} days
        - Absent: ${(stats?.total || 0) - (stats?.present || 0)} days
        - Attendance Rate: ${stats?.rate || 0}%
        
        Please provide:
        1. Academic Strengths
        2. Areas for Improvement
        3. Attendance Summary
        4. Recommendations for Parents`}
        contextData={{ grades, stats, child: currentChild }}
      />
    </div>
  );
};

export default ParentAcademic;
