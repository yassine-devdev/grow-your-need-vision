import React, { useState, useEffect } from 'react';
import { Icon, Card, Button } from '../components/shared/ui/CommonUI';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';
import { religionService, ReligiousEvent, QuranVerse } from '../services/religionService';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { motion } from 'framer-motion';

interface ReligionAppProps {
    activeTab: string;
    activeSubNav: string;
}

const ReligionApp: React.FC<ReligionAppProps> = ({ activeTab, activeSubNav }) => {
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [events, setEvents] = useState<ReligiousEvent[]>([]);
    const [verseOfDay, setVerseOfDay] = useState<QuranVerse | null>(null);
    const [loading, setLoading] = useState(true);
    const [nextPrayer, setNextPrayer] = useState<any>(null);

    const prayerTimes = {
        Fajr: '04:30',
        Dhuhr: '12:15',
        Asr: '15:45',
        Maghrib: '18:20',
        Isha: '20:00'
    };

    useEffect(() => {
        loadData();
        updateNextPrayer();

        // Update next prayer every minute
        const interval = setInterval(updateNextPrayer, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [upcomingEvents, verse] = await Promise.all([
                religionService.getUpcomingEvents(),
                religionService.getVerseOfTheDay()
            ]);
            setEvents(upcomingEvents);
            setVerseOfDay(verse);
        } catch (error) {
            console.error('Failed to load religious data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateNextPrayer = () => {
        const next = religionService.getNextPrayer();
        setNextPrayer(next);
    };

    const getCurrentPrayer = () => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const times = [
            { name: 'Fajr', minutes: 4 * 60 + 30 },
            { name: 'Dhuhr', minutes: 12 * 60 + 15 },
            { name: 'Asr', minutes: 15 * 60 + 45 },
            { name: 'Maghrib', minutes: 18 * 60 + 20 },
            { name: 'Isha', minutes: 20 * 60 }
        ];

        for (let i = times.length - 1; i >= 0; i--) {
            if (currentTime >= times[i].minutes) {
                return times[i].name;
            }
        }
        return 'Isha';
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-4 animate-fadeIn">
            {/* Prayer Time Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 text-white rounded-2xl p-8 relative overflow-hidden shadow-2xl"
            >
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-4xl font-bold font-serif mb-1">{nextPrayer?.name || 'Prayer Times'}</h2>
                            <p className="opacity-90 text-lg">
                                {nextPrayer ? `Next prayer in ${Math.floor(nextPrayer.minutesUntil / 60)}h ${nextPrayer.minutesUntil % 60}m` : 'Prayer schedule'}
                            </p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsAIModalOpen(true)}
                                className="mt-4 bg-white/20 hover:bg-white/30 text-white border-none flex items-center gap-2 backdrop-blur-sm"
                            >
                                <Icon name="Sparkles" className="w-4 h-4" />
                                Daily Reflection
                            </Button>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-bold font-mono">{nextPrayer?.time || '15:45'}</div>
                            <div className="text-xs uppercase tracking-widest opacity-80 mt-1">Local Time</div>
                        </div>
                    </div>

                    {/* Prayer Times Row */}
                    <div className="grid grid-cols-5 gap-4 border-t border-white/20 pt-6">
                        {Object.entries(prayerTimes).map(([name, time]) => {
                            const isCurrent = getCurrentPrayer() === name;
                            return (
                                <div
                                    key={name}
                                    className={`text-center transition-all ${isCurrent
                                            ? 'opacity-100 scale-110 text-yellow-300'
                                            : 'opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <div className="text-xs uppercase font-semibold">{name}</div>
                                    <div className="font-bold text-lg mt-1">{time}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="2" fill="none" />
                        <path d="M 50 5 L 50 25 M 50 75 L 50 95" stroke="white" strokeWidth="2" />
                    </svg>
                </div>
            </motion.div>

            {/* Verse of the Day */}
            {verseOfDay && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-8 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
                        <h3 className="text-sm uppercase tracking-wider text-amber-700 dark:text-amber-500 font-bold mb-4">Verse of the Day</h3>
                        <div className="text-right mb-4">
                            <p className="text-3xl font-serif leading-relaxed text-gray-900 dark:text-white mb-2">
                                {verseOfDay.arabic_text || 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ'}
                            </p>
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-4">
                            "{verseOfDay.translation || 'In the name of Allah, the Most Gracious, the Most Merciful.'}"
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-bold">Surah {verseOfDay.surah_name || 'Al-Fatihah'} • Verse {verseOfDay.verse_number || 1}</span>
                            <Button variant="ghost" size="sm">
                                <Icon name="BookmarkIcon" className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Icon name="CalendarIcon" className="w-6 h-6 text-emerald-600" />
                            Upcoming Events
                        </h2>

                        {events.length > 0 ? (
                            <div className="space-y-3">
                                {events.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="p-4 hover:shadow-lg transition-all cursor-pointer">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex flex-col items-center justify-center flex-shrink-0">
                                                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                                        {new Date(event.date).getDate()}
                                                    </div>
                                                    <div className="text-xs text-emerald-600 dark:text-emerald-500">
                                                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                                                        {event.time && (
                                                            <span className="flex items-center gap-1">
                                                                <Icon name="ClockIcon" className="w-3 h-3" />
                                                                {event.time}
                                                            </span>
                                                        )}
                                                        {event.location && (
                                                            <span className="flex items-center gap-1">
                                                                <Icon name="MapPinIcon" className="w-3 h-3" />
                                                                {event.location}
                                                            </span>
                                                        )}
                                                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-semibold">
                                                            {event.event_type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <Card className="text-center py-12">
                                <Icon name="CalendarIcon" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400">No upcoming events</p>
                            </Card>
                        )}
                    </div>

                    {/* Resources */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Islamic Resources</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: 'Quran', icon: 'BookOpenIcon', color: 'emerald' },
                                { title: 'Hadith', icon: 'DocumentTextIcon', color: 'teal' },
                                { title: 'Lectures', icon: 'VideoCameraIcon', color: 'cyan' },
                                { title: 'Articles', icon: 'NewspaperIcon', color: 'blue' }
                            ].map((resource, i) => (
                                <motion.div
                                    key={resource.title}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.05 }}
                                >
                                    <Card className={`p-6 text-center hover:shadow-lg transition-all cursor-pointer group bg-${resource.color}-50 dark:bg-${resource.color}-900/20 border-${resource.color}-200 dark:border-${resource.color}-800`}>
                                        <Icon name={resource.icon} className={`w-12 h-12 mx-auto mb-3 text-${resource.color}-600 dark:text-${resource.color}-400 group-hover:scale-110 transition-transform`} />
                                        <h3 className={`font-bold text-${resource.color}-900 dark:text-${resource.color}-300`}>{resource.title}</h3>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Icon name="BookOpenIcon" className="w-4 h-4 mr-2" />
                                Daily Quran
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Icon name="HeartIcon" className="w-4 h-4 mr-2" />
                                Dhikr Counter
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Icon name="MapIcon" className="w-4 h-4 mr-2" />
                                Nearby Mosques
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Icon name="CalendarIcon" className="w-4 h-4 mr-2" />
                                Islamic Calendar
                            </Button>
                        </div>
                    </Card>

                    {/* Current Month */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Islamic Calendar</h3>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                                {new Date().toLocaleString('ar-SA-u-ca-islamic', { month: 'long' })}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {new Date().toLocaleString('ar-SA-u-ca-islamic', { year: 'numeric' })}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* AI Modal */}
            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={(content) => {
                    console.log("Daily Reflection:", content);
                    setIsAIModalOpen(false);
                    alert("Reflection Generated! (Check console)");
                }}
                title="Daily Spiritual Reflection"
                promptTemplate={`Provide a short, uplifting Islamic spiritual reflection for today.
        
        Include:
        - A relevant Quran verse or Hadith
        - Brief reflection on its meaning
        - Practical application for daily life
        - Encouraging message
        
        Theme: {Gratitude, Patience, Kindness, or Faith}
        Tone: Peaceful, Wise, and Inspiring`}
                contextData={{ prayer: nextPrayer?.name, time: new Date().toLocaleTimeString() }}
            />
        </div>
    );
};

export default ReligionApp;