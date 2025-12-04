import React from 'react';
import MainLayout from './MainLayout';
import { STUDENT_CONFIG } from '../../data/AppConfigs';
import StudentDashboard from '../../apps/dashboards/StudentDashboard';
import StudentCourses from '../../apps/student/Courses';
import StudentAssignments from '../../apps/student/Assignments';
import ActivitiesApp from '../../apps/ActivitiesApp';
import Wellness from '../../apps/Wellness';
import Tools from '../../apps/Tools';
import StudentConcierge from '../../apps/student/StudentConcierge';

import { ErrorBoundary } from '../shared/ErrorBoundary';

const StudentLayout: React.FC = () => {
  const renderContent = (activeModule: string, activeTab: string, activeSubNav: string) => {
    console.log('StudentLayout renderContent:', activeModule, activeTab);
    const props = { activeTab, activeSubNav };
    
    const content = (() => {
        switch (activeModule) {
        case 'dashboard': return <StudentDashboard {...props} />;
        case 'courses': return <StudentCourses {...props} />;
        case 'assignments': return <StudentAssignments {...props} />;
        case 'activities': return <ActivitiesApp {...props} />;
        case 'wellness': return <Wellness {...props} />;
        case 'tools': return <Tools {...props} />;
        case 'concierge_ai': return <StudentConcierge {...props} />;
        default: return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <h2 className="text-2xl font-bold">Student {activeModule} Module</h2>
                <p>Under Development for {activeTab}</p>
            </div>
        );
        }
    })();

    return (
        <ErrorBoundary>
            {content}
        </ErrorBoundary>
    );
  };

  return <MainLayout config={STUDENT_CONFIG} renderContent={renderContent} role="Student" />;
};

export default StudentLayout;
