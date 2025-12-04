import React from 'react';
import { useRealtimeContext } from '../../context/RealtimeContext';
import { Icon } from './ui/CommonUI';

export const RealtimeStatus: React.FC = () => {
    const { isConnected, notifications, markAsRead } = useRealtimeContext();
    const [showNotifications, setShowNotifications] = React.useState(false);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
            {/* Notification Toast Area */}
            <div className="flex flex-col gap-2 mb-2">
                {notifications.slice(0, 3).map(n => (
                    <div key={n.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg shadow-lg flex items-start gap-3 w-80 animate-slideInRight">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            n.type === 'error' ? 'bg-red-500' : 
                            n.type === 'success' ? 'bg-green-500' : 
                            'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                            <p className="text-sm text-gray-800 dark:text-white font-medium">{n.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(n.created).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={() => markAsRead(n.id)} className="text-gray-400 hover:text-gray-600">
                            <Icon name="XMarkIcon" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Status Indicator */}
            <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all ${
                    isConnected 
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}
            >
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isConnected ? 'Live Updates Active' : 'Reconnecting...'}
            </div>
        </div>
    );
};
