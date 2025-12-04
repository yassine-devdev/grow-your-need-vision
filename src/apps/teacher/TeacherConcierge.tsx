import React from 'react';
import { RoleBasedAIChat } from '../../components/shared/RoleBasedAIChat';

interface Props {
  activeTab: string;
  activeSubNav: string;
}

const TeacherConcierge: React.FC<Props> = ({ activeTab, activeSubNav }) => {
  return (
    <div className="h-full p-6">
      <RoleBasedAIChat 
        role="teacher" 
        context={`Tab: ${activeTab}, SubNav: ${activeSubNav}`}
        title="Teaching Assistant"
        subtitle="Lesson planning, grading assistance, and classroom management."
      />
    </div>
  );
};

export default TeacherConcierge;
