import React, { useState } from 'react';
import { Icon, Card, Button } from '../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface ReligionAppProps {
  activeTab: string;
  activeSubNav: string;
}

const ReligionApp: React.FC<ReligionAppProps> = ({ activeTab, activeSubNav }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 animate-fadeIn">
        {/* Prayer Time Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-900 text-white rounded-2xl p-8 relative overflow-hidden shadow-xl">
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold font-serif mb-1">Asr Prayer</h2>
                        <p className="opacity-80">Next prayer in 45 minutes</p>
                        <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => setIsAIModalOpen(true)}
                            className="mt-4 bg-white/20 hover:bg-white/30 text-white border-none flex items-center gap-2"
                        >
                            <Icon name="Sparkles" className="w-4 h-4" />
                            Daily Reflection
                        </Button>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold font-mono">15:45</div>
                        <div className="text-xs uppercase tracking-widest opacity-70">Makkah Time</div>
                    </div>
                </div>
                
                <div className="flex gap-8 mt-8 border-t border-white/20 pt-6 overflow-x-auto">
                    <div className="text-center opacity-70"><div className="text-xs uppercase">Fajr</div><div className="font-bold">04:30</div></div>
                    <div className="text-center opacity-70"><div className="text-xs uppercase">Dhuhr</div><div className="font-bold">12:15</div></div>
                    <div className="text-center font-bold text-yellow-300 scale-110"><div className="text-xs uppercase">Asr</div><div className="font-bold">15:45</div></div>
                    <div className="text-center opacity-70"><div className="text-xs uppercase">Maghrib</div><div className="font-bold">18:20</div></div>
                    <div className="text-center opacity-70"><div className="text-xs uppercase">Isha</div><div className="font-bold">20:00</div></div>
                </div>
            </div>
            <Icon name="ReligionIcon3D" className="w-64 h-64 absolute -bottom-10 -right-10 opacity-10" />
        </div>

        {/* Content Section */}
        <div>
            <h1 className="text-2xl font-bold text-gyn-blue-dark dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">{activeTab} - {activeSubNav}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <span className="font-serif font-bold text-xl">{i}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white">Chapter {i}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Verses: {i*10}</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 font-serif italic">
                            "Example text from the scripture goes here. It provides spiritual guidance and wisdom..."
                        </p>
                    </Card>
                ))}
            </div>
        </div>

        <AIContentGeneratorModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            onSuccess={(content) => {
                console.log("Daily Reflection:", content);
                setIsAIModalOpen(false);
                alert("Reflection Generated! (Check console)");
            }}
            title="Daily Spiritual Reflection"
            promptTemplate={`Provide a short, uplifting spiritual reflection or quote relevant to [Time of Day/Season].
            
            Theme: Gratitude, Patience, or Community.
            Tone: Peaceful and Wise.`}
            contextData={{ time: new Date().toLocaleTimeString() }}
        />
    </div>
  );
};

export default ReligionApp;