import React, { useState } from 'react';
import { Card, Button, Icon } from '../../components/shared/ui/CommonUI';
import { MediaContentManager } from './content-managers/MediaContentManager';
import { SportContentManager } from './content-managers/SportContentManager';

export const OverlayAppsManager: React.FC = () => {
    const [selectedApp, setSelectedApp] = useState<string>('media');

    const overlayApps = [
        { id: 'media', name: 'Media', icon: 'FilmIcon', description: 'Movies, Series & Live TV', color: 'red' },
        { id: 'sport', name: 'Sport', icon: 'TrophyIcon', description: 'Teams, Matches & Stats', color: 'green' },
        { id: 'gamification', name: 'Gamification', icon: 'SparklesIcon', description: 'Achievements & Rewards', color: 'yellow' },
        { id: 'travel', name: 'Travel', icon: 'GlobeAltIcon', description: 'Destinations & Bookings', color: 'blue' },
        { id: 'help', name: 'Help Center', icon: 'QuestionMarkCircleIcon', description: 'FAQs & Support', color: 'purple' },
        { id: 'hobbies', name: 'Hobbies', icon: 'PaintBrushIcon', description: 'Projects & Skills', color: 'pink' },
        { id: 'religion', name: 'Religion', icon: 'BookOpenIcon', description: 'Prayer Times & Events', color: 'emerald' },
        { id: 'services', name: 'Services', icon: 'WrenchIcon', description: 'Service Marketplace', color: 'orange' },
        { id: 'activities', name: 'Activities', icon: 'CalendarIcon', description: 'Activity Catalog', color: 'indigo' },
        { id: 'events', name: 'Events', icon: 'TicketIcon', description: 'Event Management', color: 'cyan' },
        { id: 'messaging', name: 'Messaging', icon: 'ChatBubbleLeftRightIcon', description: 'Chat & Messages', color: 'teal' },
        { id: 'creator', name: 'Creator Studio', icon: 'VideoCameraIcon', description: 'Content Creation', color: 'rose' },
        { id: 'market', name: 'Market', icon: 'ShoppingCartIcon', description: 'E-commerce', color: 'amber' }
    ];

    const renderContentManager = () => {
        switch (selectedApp) {
            case 'media':
                return <MediaContentManager />;

            case 'sport':
                return <SportContentManager />;

            // Placeholders for other apps
            case 'gamification':
            case 'travel':
            case 'help':
            case 'hobbies':
            case 'religion':
            case 'services':
            case 'activities':
            case 'events':
            case 'messaging':
            case 'creator':
            case 'market':
                return (
                    <div className="text-center py-20">
                        <Icon name="Cog6ToothIcon" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {overlayApps.find(app => app.id === selectedApp)?.name} Manager
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Content management for this app is coming soon
                        </p>
                        <div className="max-w-md mx-auto bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>Note:</strong> The {overlayApps.find(app => app.id === selectedApp)?.name} app is fully functional for users.
                                This admin interface will allow you to manage content centrally.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex h-full">
            {/* Sidebar - App Selection */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Overlay Apps</h2>

                <div className="space-y-2">
                    {overlayApps.map(app => (
                        <button
                            key={app.id}
                            onClick={() => setSelectedApp(app.id)}
                            className={`w-full text-left p-4 rounded-lg transition-all ${selectedApp === app.id
                                    ? `bg-${app.color}-100 dark:bg-${app.color}-900/30 border-2 border-${app.color}-500`
                                    : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-${app.color}-500 flex items-center justify-center flex-shrink-0`}>
                                    <Icon name={app.icon} className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold truncate ${selectedApp === app.id
                                            ? `text-${app.color}-900 dark:text-${app.color}-100`
                                            : 'text-gray-900 dark:text-white'
                                        }`}>
                                        {app.name}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {app.description}
                                    </p>
                                </div>
                                {selectedApp === app.id && (
                                    <Icon name="CheckCircleIcon" className={`w-5 h-5 text-${app.color}-600 flex-shrink-0`} />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <Icon name="InformationCircleIcon" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Quick Tip</h4>
                            <p className="text-xs text-blue-800 dark:text-blue-300">
                                Manage all content for your overlay apps from here. Add movies, channels, events, and more!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
                {renderContentManager()}
            </div>
        </div>
    );
};
