import React from 'react';
import { OwnerIcon } from '../../../components/shared/OwnerIcons';
import { SystemAlert } from '../../../services/ownerService';

interface AlertListProps {
    alerts: SystemAlert[];
}

export const AlertList: React.FC<AlertListProps> = ({ alerts }) => {
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-50 border-red-100 text-red-700';
            case 'warning': return 'bg-yellow-50 border-yellow-100 text-yellow-700';
            case 'info': return 'bg-blue-50 border-blue-100 text-blue-700';
            default: return 'bg-gray-50 border-gray-100 text-gray-700';
        }
    };

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return 'ExclamationCircle';
            case 'warning': return 'ExclamationTriangle';
            case 'info': return 'InformationCircle';
            default: return 'Bell';
        }
    };

    return (
        <div className="space-y-3">
            {alerts.map(alert => (
                <div 
                    key={alert.id} 
                    className={`p-4 rounded-xl border flex items-start gap-3 ${getSeverityStyles(alert.severity)}`}
                >
                    <OwnerIcon name={getIcon(alert.severity)} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-bold text-sm">{alert.message}</p>
                        <p className="text-xs opacity-80 mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    {alert.actionUrl && (
                        <button className="text-xs font-bold underline hover:opacity-80">
                            View
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};
