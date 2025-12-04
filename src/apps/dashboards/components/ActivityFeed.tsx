import React from 'react';
import { AuditLog } from '../../../services/ownerService';
import { Icon } from '../../../components/shared/ui/CommonUI';

interface ActivityFeedProps {
    activities: AuditLog[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                No recent activity
            </div>
        );
    }

    const getIconForModule = (module: string) => {
        switch (module) {
            case 'Tenants': return 'UserGroup';
            case 'Billing': return 'Banknotes';
            case 'Tickets': return 'Ticket';
            default: return 'Bell';
        }
    };

    const getColorForModule = (module: string) => {
        switch (module) {
            case 'Tenants': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Billing': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'Tickets': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 items-start">
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getColorForModule(activity.module)}`}>
                        <Icon name={getIconForModule(activity.module)} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {JSON.stringify(activity.details)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(activity.created).toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
