import React, { useState } from 'react';
import { OwnerIcon } from '../components/shared/OwnerIcons';
import { Button, Icon } from '../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface HobbiesAppProps {
  activeTab: string;
  activeSubNav: string;
}

const HobbiesApp: React.FC<HobbiesAppProps> = ({ activeTab, activeSubNav }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-pink-100 rounded-2xl text-pink-600">
                    <OwnerIcon name="Hobbies" className="w-10 h-10" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gyn-blue-dark">My Hobbies</h1>
                    <p className="text-gray-500">Track your passions and collections.</p>
                </div>
            </div>
            <Button 
                variant="outline" 
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center gap-2 text-pink-600 border-pink-200 hover:bg-pink-50"
            >
                <Icon name="Sparkles" className="w-4 h-4" />
                Discover New Hobbies
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                    <div className="h-48 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                        <OwnerIcon name="Sparkles" className="w-24 h-24 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-600">
                            {activeSubNav}
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-2">Project Title {i}</h3>
                        <div className="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">
                            <div className="bg-pink-500 h-full" style={{width: `${i * 15}%`}}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Last updated 2 days ago</span>
                            <span className="font-bold text-pink-600">{i * 15}% Complete</span>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Add New Card */}
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-6 hover:bg-gray-100 hover:border-gray-400 cursor-pointer transition-colors">
                <OwnerIcon name="PlusCircleIcon" className="w-12 h-12 mb-2" />
                <span className="font-bold">Start New Project</span>
            </div>
        </div>

        <AIContentGeneratorModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            onSuccess={(content) => {
                console.log("Hobby Suggestions:", content);
                setIsAIModalOpen(false);
            }}
            title="Discover New Hobbies"
            promptTemplate={`Suggest 3 new hobbies for someone interested in [Interests (e.g., Technology, Art, Outdoors)].
            
            For each hobby, include:
            - Brief Description
            - Getting Started Cost (Low/Medium/High)
            - First Step to take`}
            contextData={{ interests: activeSubNav || 'General' }}
        />
    </div>
  );
};

export default HobbiesApp;