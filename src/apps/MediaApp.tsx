
import React, { useState, useEffect } from 'react';
import { Icon, Button } from '../components/shared/ui/CommonUI';
import { mediaService, MediaItem } from '../services/mediaService';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface MediaAppProps {
  activeTab: string;
  activeSubNav: string;
}

const MediaApp: React.FC<MediaAppProps> = ({ activeTab, activeSubNav }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
      const fetchMedia = async () => {
          setLoading(true);
          try {
              let filter = '';
              if (activeSubNav === 'Movies') filter = 'type = "Movie"';
              else if (activeSubNav === 'Series') filter = 'type = "Series"';
              else if (activeSubNav === 'Docs') filter = 'type = "Documentary"';

              const result = await mediaService.getMedia(filter);
              setMediaItems(result.items);
              
              if (result.items.length > 0) {
                  setFeaturedItem(result.items[0]);
              }
          } catch (e) {
              console.error("Error fetching media:", e);
          } finally {
              setLoading(false);
          }
      };
      fetchMedia();
  }, [activeSubNav]);

  return (
    <div className="min-h-full bg-[#0a0a0a] text-white -m-8 p-8 relative overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

        {/* Hero Section - Cinematic */}
        {featuredItem && (
        <div className="relative h-[450px] rounded-3xl overflow-hidden mb-10 group shadow-2xl border border-white/5">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-[20s]"></div>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent z-10"></div>
            
            <div className="absolute bottom-0 left-0 p-10 z-20 max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest shadow-lg shadow-red-900/50">New Release</span>
                    <span className="text-gray-300 text-xs font-bold border border-white/20 px-2 py-1 rounded">4K HDR</span>
                </div>
                
                <h1 className="text-6xl font-black mb-4 leading-none tracking-tight drop-shadow-2xl uppercase">
                    {featuredItem.title}
                </h1>
                
                <p className="text-gray-200 mb-8 text-lg font-medium leading-relaxed max-w-xl drop-shadow-md">
                    {featuredItem.description}
                </p>
                
                <div className="flex gap-4">
                    <Button variant="primary" size="lg" className="bg-white text-black hover:bg-gray-200 border-none">
                        <Icon name="PlayIcon" className="w-6 h-6 fill-black mr-2" /> Play Now
                    </Button>
                    <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
                        <Icon name="PlusCircleIcon" className="w-6 h-6 mr-2" /> My List
                    </Button>
                </div>
            </div>
        </div>
        )}

        {/* Content Rows */}
        <div className="relative z-10">
            <div className="mb-6 flex items-end justify-between border-b border-white/10 pb-2">
                <div>
                    <h2 className="text-2xl font-bold text-white">{activeSubNav || activeTab}</h2>
                    <p className="text-xs text-gray-500 mt-1">Top picks for you</p>
                </div>
                <div className="flex gap-4 items-center">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsAIModalOpen(true)}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                    >
                        <Icon name="Sparkles" className="w-4 h-4" />
                        AI Recommendation
                    </Button>
                    <button className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors">View All</button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading media...</div>
                ) : mediaItems.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">No media found.</div>
                ) : (
                    mediaItems.map((item, i) => (
                    <div key={item.id} className="group relative cursor-pointer perspective-1000">
                        {/* Poster */}
                        <div className="aspect-[2/3] rounded-xl bg-gray-800 relative overflow-hidden transition-all duration-300 group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/5 ring-2 ring-transparent group-hover:ring-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                {/* Placeholder for poster image */}
                                <span className="text-6xl font-black text-white/5">{i + 1}</span>
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
                                     <Icon name="PlayIcon" className="w-6 h-6 text-white fill-white ml-1" />
                                </div>
                                <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                                    <button className="p-2 bg-white/20 rounded-full hover:bg-white/40"><Icon name="PlusCircleIcon" className="w-4 h-4" /></button>
                                    <button className="p-2 bg-white/20 rounded-full hover:bg-white/40"><Icon name="HandThumbUpIcon" className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Reflection Effect */}
                        <div className="absolute -bottom-4 left-0 right-0 h-10 bg-gradient-to-b from-white/10 to-transparent transform scale-y-[-1] opacity-0 group-hover:opacity-20 transition-opacity blur-sm rounded-b-xl pointer-events-none"></div>

                        {/* Meta */}
                        <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                                <span className="text-green-400 font-bold">{item.matchScore}% Match</span>
                                <span>•</span>
                                <span className="border border-gray-600 px-1 rounded">{item.rating}</span>
                                <span>•</span>
                                <span>{item.duration}</span>
                            </div>
                        </div>
                    </div>
                )))}
            </div>
        </div>

        <AIContentGeneratorModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            onSuccess={(content) => {
                console.log("Media Recommendation:", content);
                setIsAIModalOpen(false);
                alert("Recommendation Generated! (Check console)");
            }}
            title="AI Movie Concierge"
            promptTemplate={`Recommend 3 movies/shows based on the genre: [Genre].
            
            For each recommendation:
            - Title
            - Why I'll like it
            - Streaming Platform`}
            contextData={{ genre: activeSubNav || 'Action' }}
        />
    </div>
  );
};

export default MediaApp;
