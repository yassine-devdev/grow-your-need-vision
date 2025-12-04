
import React from 'react';
import MainLayout from './MainLayout';
import { INDIVIDUAL_CONFIG } from '../../data/AppConfigs';
import IndividualDashboard from '../../apps/IndividualDashboard';
import ProjectsApp from '../../apps/ProjectsApp';
import IndividualLearning from '../../apps/individual/Learning';
import MarketApp from '../../apps/MarketApp';
import Wellness from '../../apps/Wellness';
import PlatformSettings from '../../apps/PlatformSettings';
import Tools from '../../apps/Tools';
import ConciergeAI from '../../apps/ConciergeAI';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const IndividualLayout: React.FC = () => {
  const renderContent = (activeModule: string, activeTab: string, activeSubNav: string) => {
    const props = { activeTab, activeSubNav };
    const content = (() => {
      switch (activeModule) {
        case 'dashboard': return <IndividualDashboard {...props} />;
        case 'projects': return <ProjectsApp {...props} />;
        case 'learning': return <IndividualLearning {...props} />;
        case 'wellness': return <Wellness {...props} />;
        case 'settings': return <PlatformSettings {...props} />;
        case 'tools': return <Tools {...props} />;
        case 'concierge_ai': return <ConciergeAI {...props} />;
        default: return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <h2 className="text-2xl font-bold">Individual {activeModule} Module</h2>
              <p>Under Development for {activeTab}</p>
          </div>
        );
      }
    })();

    return <ErrorBoundary>{content}</ErrorBoundary>;
  };

  return <MainLayout config={INDIVIDUAL_CONFIG} renderContent={renderContent} role="Individual" />;
};

export default IndividualLayout;
