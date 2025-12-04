import React, { useState } from 'react';
import { Icon, Button, Card, Badge } from '../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface TravelAppProps {
  activeTab: string;
  activeSubNav: string;
}

const TravelApp: React.FC<TravelAppProps> = ({ activeTab, activeSubNav }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({ from: '', to: '', date: '' });

  return (
    <div className="h-full flex flex-col animate-fadeIn">
       {/* Map / Hero placeholder */}
       <div className="h-64 bg-blue-100 dark:bg-blue-900/30 relative rounded-xl overflow-hidden mb-6 flex items-center justify-center group shrink-0">
           <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=600x300&sensor=false')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all"></div>
           <div className="relative z-10 text-center">
               <h1 className="text-4xl font-black text-gyn-blue-dark dark:text-white drop-shadow-md">{activeSubNav || 'Explore the World'}</h1>
               <Button 
                 variant="primary" 
                 className="mt-4 mx-auto shadow-lg"
                 leftIcon={<Icon name="MapPinIcon" className="w-4 h-4" />}
               >
                 Start Planning
               </Button>
           </div>
       </div>

       {/* Booking Widgets */}
       <Card variant="default" className="p-6 mb-8">
           <div className="flex flex-wrap gap-4 items-end">
               <div className="flex-1 min-w-[200px]">
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">From</label>
                   <input 
                    type="text" 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-800 focus:border-blue-500 outline-none" 
                    placeholder="New York (JFK)" 
                    value={searchParams.from}
                    onChange={e => setSearchParams({...searchParams, from: e.target.value})}
                   />
               </div>
               <div className="flex-1 min-w-[200px]">
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">To</label>
                   <input 
                    type="text" 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-800 focus:border-blue-500 outline-none" 
                    placeholder="Tokyo (HND)" 
                    value={searchParams.to}
                    onChange={e => setSearchParams({...searchParams, to: e.target.value})}
                   />
               </div>
               <div className="flex-1 min-w-[150px]">
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Date</label>
                   <input 
                    type="date" 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-800 focus:border-blue-500 outline-none" 
                    value={searchParams.date}
                    onChange={e => setSearchParams({...searchParams, date: e.target.value})}
                   />
               </div>
               <div className="flex gap-2">
                   <Button 
                    variant="outline" 
                    className="h-[50px] px-4 border-purple-200 text-purple-600 hover:bg-purple-50"
                    onClick={() => setIsAIModalOpen(true)}
                    title="Generate Itinerary with AI"
                   >
                       <Icon name="Sparkles" className="w-5 h-5" />
                   </Button>
                   <Button variant="primary" className="h-[50px] px-8 bg-gyn-orange hover:bg-orange-600 border-none">Search</Button>
               </div>
           </div>
       </Card>

       {/* Featured Destinations */}
       <div>
           <h2 className="text-xl font-bold text-gyn-blue-dark dark:text-white mb-4">Popular in {activeTab}</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => (
                   <Card key={i} variant="default" className="overflow-hidden hover:shadow-lg transition-shadow p-0">
                       <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                            {/* Img placeholder */}
                            <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-xs font-bold text-blue-800 dark:text-blue-300">
                                5 Nights • $1,200
                            </div>
                       </div>
                       <div className="p-4">
                           <h3 className="font-bold text-lg text-gray-800 dark:text-white">Destination {i}</h3>
                           <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                               <Icon name="MapPinIcon" className="w-3 h-3" /> Asia Pacific
                           </div>
                       </div>
                   </Card>
               ))}
           </div>
       </div>

       <AIContentGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccess={(content) => {
            console.log("Itinerary:", content);
            setIsAIModalOpen(false);
        }}
        title="Generate Travel Itinerary"
        promptTemplate={`Create a 5-day travel itinerary for a trip from ${searchParams.from || '[Origin]'} to ${searchParams.to || '[Destination]'}.
        
        Include:
        - Daily activities (Morning, Afternoon, Evening)
        - Must-visit landmarks
        - Local food recommendations
        - Estimated budget tips`}
        contextData={searchParams}
       />
    </div>
  );
};

export default TravelApp;