import React, { useState } from 'react';
import { Icon, Card, Button } from '../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface SportAppProps {
  activeTab: string;
  activeSubNav: string;
}

const SportApp: React.FC<SportAppProps> = ({ activeTab, activeSubNav }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <>
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
        {/* Live Scoreboard */}
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Sports</h1>
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
                <Icon name="Sparkles" className="w-4 h-4" />
                AI Match Analysis
            </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[200px] bg-black dark:bg-gray-900 text-white rounded-lg p-3 flex justify-between items-center shadow-md border border-gray-800">
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">TEAM A</div>
                        <span className="font-bold text-lg">2</span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono text-center">
                        <span className="text-red-500 font-bold block">• LIVE</span>
                        <span>45:00</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">TEAM B</div>
                        <span className="font-bold text-lg">1</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{activeSubNav} Highlights</h2>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
                        <Icon name="PlayIcon" className="w-16 h-16 text-gray-400 group-hover:text-green-600 transition-colors z-10" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                    </div>
                    <h3 className="mt-3 font-bold text-lg text-gray-900 dark:text-white">Match of the Day: Championship Finals</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full breakdown of the incredible performance in today's main event.</p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[1, 2, 3, 4].map(i => (
                         <div key={i} className="flex gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                             <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-md shrink-0"></div>
                             <div>
                                 <h4 className="font-bold text-sm line-clamp-2 text-gray-900 dark:text-white">Top 10 plays from the season so far</h4>
                                 <span className="text-[10px] text-gray-400 mt-1 block">2 hours ago</span>
                             </div>
                         </div>
                     ))}
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Standings</h3>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-gray-400 w-4">{i}</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">Team Name</span>
                                </div>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">{80 - i*2} Pts</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    </div>

    <AIContentGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccess={(content) => {
            console.log("Match Analysis:", content);
            setIsAIModalOpen(false);
            alert("Analysis Generated! (Check console)");
        }}
        title="AI Match Analysis"
        promptTemplate={`Analyze the current game situation for [Team A] vs [Team B].
        
        Score: 2-1
        Time: 45:00
        
        Provide:
        - Key Tactical Insights
        - Predicted Outcome
        - Player to Watch`}
        contextData={{ sport: activeSubNav || 'Football' }}
    />
    </>
  );
};

export default SportApp;