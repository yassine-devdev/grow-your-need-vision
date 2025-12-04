import React from 'react';
import { RoleBasedAIChat } from '../../components/shared/RoleBasedAIChat';

interface Props {
  activeTab: string;
  activeSubNav: string;
}

const StudentConcierge: React.FC<Props> = ({ activeTab, activeSubNav }) => {
  return (
    <div className="h-full p-6">
      <RoleBasedAIChat 
        role="student" 
        context={`Tab: ${activeTab}, SubNav: ${activeSubNav}`}
        title="Study Buddy"
        subtitle="Your personal AI tutor and homework helper."
      />
    </div>
  );
};

export default StudentConcierge;
