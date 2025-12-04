
import React from 'react';
import MainLayout from './MainLayout';
import { TEACHER_CONFIG } from '../../data/AppConfigs';
import TeacherDashboard from '../../apps/dashboards/TeacherDashboard';
import TeacherClasses from '../../apps/teacher/Classes';
import TeacherAssignments from '../../apps/teacher/Assignments';
import TeacherResources from '../../apps/teacher/Resources';
import TeacherCommunication from '../../apps/teacher/Communication';
import Wellness from '../../apps/Wellness';
import Tools from '../../apps/Tools';
import TeacherConcierge from '../../apps/teacher/TeacherConcierge';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const TeacherLayout: React.FC = () => {
  const renderContent = (activeModule: string, activeTab: string, activeSubNav: string) => {
    const props = { activeTab, activeSubNav };
    const content = (() => {
      switch (activeModule) {
        case 'dashboard': return <TeacherDashboard {...props} />;
        case 'classes': return <TeacherClasses {...props} />;
        case 'assignments': return <TeacherAssignments {...props} />;
        case 'resources': return <TeacherResources {...props} />;
        case 'communication': return <TeacherCommunication {...props} />;
        case 'wellness': return <Wellness {...props} />;
        case 'tools': return <Tools {...props} />;
        case 'concierge_ai': return <TeacherConcierge {...props} />;
        default: return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <h2 className="text-2xl font-bold">Teacher {activeModule} Module</h2>
              <p>Under Development for {activeTab}</p>
          </div>
        );
      }
    })();

    return <ErrorBoundary>{content}</ErrorBoundary>;
  };

  return <MainLayout config={TEACHER_CONFIG} renderContent={renderContent} role="Teacher" />;
};

export default TeacherLayout;
