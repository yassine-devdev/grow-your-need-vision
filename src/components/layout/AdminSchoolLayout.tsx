
import React from 'react';
import MainLayout from './MainLayout';
import { SCHOOL_ADMIN_CONFIG } from '../../data/AppConfigs';
import SchoolAdminDashboard from '../../apps/dashboards/SchoolAdminDashboard';
import SchoolCRM from '../../apps/school/crm/SchoolCRM';
import Academics from '../../apps/school/Academics';
import Enrollment from '../../apps/school/Enrollment';
import People from '../../apps/school/People';
import Finance from '../../apps/school/Finance';
import Attendance from '../../apps/school/Attendance';
import Grades from '../../apps/school/Grades';
import Services from '../../apps/school/Services';
import Communication from '../../apps/Communication';
import Wellness from '../../apps/Wellness';
import PlatformSettings from '../../apps/PlatformSettings';
import Tools from '../../apps/Tools';
import SchoolConcierge from '../../apps/school/SchoolConcierge';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const AdminSchoolLayout: React.FC = () => {
  const renderContent = (activeModule: string, activeTab: string, activeSubNav: string) => {
    const props = { activeTab, activeSubNav };
    const content = (() => {
      switch (activeModule) {
        case 'dashboard': return <SchoolAdminDashboard {...props} />;
        case 'crm': return <SchoolCRM {...props} />;
        case 'academics': return <Academics {...props} />;
        case 'enrollment': return <Enrollment />;
        case 'people': return <People {...props} />;
        case 'finance': return <Finance {...props} />;
        case 'attendance': return <Attendance {...props} />;
        case 'grades': return <Grades {...props} />;
        case 'services': return <Services {...props} />;
        case 'communication': return <Communication {...props} />;
        case 'wellness': return <Wellness {...props} />;
        case 'settings': return <PlatformSettings {...props} />;
        case 'tools': return <Tools {...props} />;
        case 'concierge_ai': return <SchoolConcierge {...props} />;
        default: return <div>Not Found</div>;
      }
    })();

    return <ErrorBoundary>{content}</ErrorBoundary>;
  };

  return <MainLayout config={SCHOOL_ADMIN_CONFIG} renderContent={renderContent} role="School Admin" />;
};

export default AdminSchoolLayout;
// Re-eval
