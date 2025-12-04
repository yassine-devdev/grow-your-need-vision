import React, { useState } from 'react';
import { OwnerIcon } from '../components/shared/OwnerIcons';
import { Button, Icon } from '../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface GamificationAppProps {
  activeTab: string;
  activeSubNav: string;
}

const GamificationApp: React.FC<GamificationAppProps> = ({ activeTab, activeSubNav }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 py-8 bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-blue-100 relative overflow-hidden">
            <div className="absolute top-4 right-4">
                <Button 
                    variant="outline" 
                    onClick={() => setIsAIModalOpen(true)}
                    className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                    <Icon name="Sparkles" className="w-4 h-4" />
                    New Challenge
                </Button>
            </div>
            <div className="inline-block p-4 bg-yellow-100 rounded-full text-yellow-600 mb-4 shadow-sm border border-yellow-200">
                <OwnerIcon name="TrophyIcon" className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black text-gyn-blue-dark mb-2">Level 42</h1>
            <p className="text-gray-500 font-medium">Grand Master • 12,450 XP</p>
            
            <div className="max-w-md mx-auto mt-6">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>Progress to Level 43</span>
                    <span>85%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[85%]"></div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Badges Grid */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className={`bg-white border rounded-xl p-6 flex flex-col items-center text-center transition-all ${i <= 4 ? 'border-yellow-400 shadow-md scale-105 z-10' : 'border-gray-200 opacity-70 grayscale'}`}>
                    <div className={`w-20 h-20 mb-4 rounded-full flex items-center justify-center ${i <= 4 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                        <OwnerIcon name="StarIcon" className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-gray-800">Achievement Name {i}</h3>
                    <p className="text-xs text-gray-500 mt-2 mb-4">Complete 100 tasks to unlock this legendary badge.</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${i <= 4 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {i <= 4 ? 'Unlocked' : 'Locked'}
                    </span>
                </div>
            ))}
        </div>

        <AIContentGeneratorModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            onSuccess={(content) => {
                console.log("New Challenge:", content);
                setIsAIModalOpen(false);
                alert("New Challenge Generated! (Check console)");
            }}
            title="Generate Daily Challenge"
            promptTemplate={`Create a fun and engaging daily challenge for a user at Level 42 (Grand Master).
            
            Theme: Productivity or Learning.
            
            Include:
            - Challenge Name
            - Description
            - XP Reward (e.g., 500 XP)
            - Completion Criteria`}
            contextData={{ level: 42, role: 'Grand Master' }}
        />
    </div>
  );
};

export default GamificationApp;