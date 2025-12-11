import React, { useState, useEffect } from 'react';
import { Icon, Card, Button, Badge, Avatar } from '../components/shared/ui/CommonUI';
import { eventService, EventActivity } from '../services/eventService';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface ActivitiesAppProps {
  activeTab: string;
  activeSubNav: string;
}

const ActivitiesApp: React.FC<ActivitiesAppProps> = ({ activeTab, activeSubNav }) => {
  const [activities, setActivities] = useState<EventActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
      const fetchActivities = async () => {
          setLoading(true);
          try {
              const result = await eventService.getActivities();
              setActivities(result.items);
          } catch (e) {
              console.error("Error fetching activities:", e);
          } finally {
              setLoading(false);
          }
      };
      fetchActivities();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
       <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-700 pb-4">
           <div>
               <h1 className="text-3xl font-black text-gyn-blue-dark dark:text-white">Local Activities</h1>
               <p className="text-gray-500 dark:text-gray-400">Discover what's happening in your community.</p>
           </div>
           <div className="flex gap-2">
               <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAIModalOpen(true)}
                    className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
               >
                    <Icon name="Sparkles" className="w-4 h-4" />
                    Plan My Weekend
               </Button>
               <Button variant="outline" size="sm">Map View</Button>
               <Button variant="primary" size="sm">Calendar View</Button>
           </div>
       </div>

       <div className="flex flex-col md:flex-row gap-6">
           {/* Filters */}
           <div className="w-full md:w-64 shrink-0 space-y-6">
               <Card className="p-4">
                   <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white uppercase">Categories</h3>
                   <div className="space-y-2">
                       {['Outdoor', 'Music', 'Food', 'Learning', 'Sports'].map(cat => (
                           <label key={cat} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                               <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                               {cat}
                           </label>
                       ))}
                   </div>
               </Card>
           </div>

           {/* Feed */}
           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
               {loading ? (
                   <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">Loading activities...</div>
               ) : activities.length === 0 ? (
                   <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">No activities found.</div>
               ) : (
                   activities.map(activity => {
                       // Handle date parsing safely
                       const dateObj = new Date(activity.created);
                       const month = dateObj.toLocaleString('default', { month: 'short' });
                       const day = dateObj.getDate();
                       const scheduleText = activity.schedule ? `${activity.schedule.day} @ ${activity.schedule.time}` : 'TBD';

                       return (
                           <Card key={activity.id} className="p-4 hover:border-orange-300 dark:hover:border-orange-500 transition-colors flex flex-col h-full">
                               <div className="flex items-start justify-between mb-4">
                                   <div className="flex items-center gap-3">
                                       <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex flex-col items-center justify-center text-orange-800 dark:text-orange-300 shrink-0">
                                           <span className="text-xs font-bold uppercase">{month}</span>
                                           <span className="text-lg font-black">{day}</span>
                                       </div>
                                       <div>
                                           <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{activity.name}</h3>
                                           <p className="text-xs text-gray-500 dark:text-gray-400">{activity.location || 'TBD'} • {scheduleText}</p>
                                       </div>
                                   </div>
                                   <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                                       <Icon name="ShareIcon" className="w-4 h-4" />
                                   </button>
                               </div>
                               
                               <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-1">
                                   {activity.description}
                               </p>
                               
                               <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                                   <div className="flex -space-x-2">
                                       {[1,2,3].map(u => (
                                            <div key={u} className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800"></div>
                                       ))}
                                       <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-500 dark:text-gray-400">
                                           +{activity.capacity || 0}
                                       </div>
                                   </div>
                                   <button className="text-sm font-bold text-gyn-blue-dark dark:text-blue-400 hover:underline">RSVP</button>
                               </div>
                           </Card>
                       );
                   })
               )}
           </div>
       </div>

       <AIContentGeneratorModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            onSuccess={(content) => {
                console.log("Weekend Plan:", content);
                setIsAIModalOpen(false);
                alert("Weekend Plan Generated! (Check console)");
            }}
            title="AI Weekend Planner"
            promptTemplate={`Create a fun weekend itinerary for a [User Type (e.g., Family, Couple, Solo)].
            
            Include:
            - Saturday Morning Activity
            - Saturday Evening Event
            - Sunday Brunch Spot
            
            Based on available activities:
            ${activities.slice(0, 5).map(a => `- ${a.name}`).join('\n')}`}
            contextData={{ userType: 'Family' }}
        />
    </div>
  );
};

export default ActivitiesApp;
