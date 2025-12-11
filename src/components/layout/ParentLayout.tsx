
import React from 'react';
import MainLayout from './MainLayout';
import { PARENT_CONFIG } from '../../data/AppConfigs';
import ParentDashboard from '../../apps/dashboards/ParentDashboard';
import ParentAcademic from '../../apps/parent/Academic';
import ParentFinance from '../../apps/parent/Finance';
import ParentCommunication from '../../apps/parent/Communication';
import Wellness from '../../apps/Wellness';
import Tools from '../../apps/Tools';
import ParentConcierge from '../../apps/parent/ParentConcierge';
// New components
import Dashboard from '../../apps/parent/Dashboard';
import Attendance from '../../apps/parent/Attendance';
import Grades from '../../apps/parent/Grades';
import Schedule from '../../apps/parent/Schedule';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const ParentLayout: React.FC = () => {
  const renderContent = (activeModule: string, activeTab: string, activeSubNav: string) => {
    const props = { activeTab, activeSubNav };
    const content = (() => {
      switch (activeModule) {
        case 'dashboard': return <Dashboard />;
        case 'attendance': return <Attendance />;
        case 'grades': return <Grades />;
        case 'schedule': return <Schedule />;
        case 'academic': return <ParentAcademic {...props} />;
        case 'finance': return <ParentFinance {...props} />;
        case 'communication': return <ParentCommunication {...props} />;
        case 'wellness': return <Wellness {...props} />;
        case 'tools': return <Tools {...props} />;
        case 'concierge': return <ParentConcierge {...props} />;
        default: return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <h2 className="text-2xl font-bold">Parent {activeModule} Module</h2>
            <p>Under Development for {activeTab}</p>
          </div>
        );
      }
    })();

    return <ErrorBoundary>{content}</ErrorBoundary>;
  };

  return <MainLayout config={PARENT_CONFIG} renderContent={renderContent} role="Parent" />;
};

export default ParentLayout;
