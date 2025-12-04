import React from 'react';
import { OwnerIcon } from '../../../components/shared/OwnerIcons';
import { DashboardKPI } from '../../../services/ownerService';

interface KPICardProps {
    kpi: DashboardKPI;
    icon: string;
    className?: string;
    compact?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, icon, className = '', compact = false }) => {
    const isPositive = kpi.change >= 0;
    // For churn, down is good (green), up is bad (red)
    const isChurn = kpi.label.toLowerCase().includes('churn');
    const trendColor = isChurn 
        ? (isPositive ? 'text-red-500' : 'text-green-500')
        : (isPositive ? 'text-green-500' : 'text-red-500');
    
    const TrendIcon = isPositive ? 'ArrowTrendingUp' : 'ArrowTrendingDown';

    return (
        <div className={`
            ${compact ? 'bg-transparent border-none shadow-none p-0' : 'bg-white/60 dark:bg-material-gunmetal/40 backdrop-blur-xl p-3 md:p-6 rounded-2xl shadow-sm dark:shadow-glass border border-white/50 dark:border-white/5 hover:shadow-md dark:hover:shadow-hud-glow'} 
            transition-all duration-300 group ${className}
        `}>
            <div className={`flex justify-between items-start ${compact ? 'mb-1' : 'mb-2 md:mb-4'}`}>
                <div className={`
                    ${compact ? 'p-1.5 rounded-lg' : 'p-2 md:p-3 rounded-xl'} 
                    bg-${kpi.color}-50/80 dark:bg-white/5 text-${kpi.color}-600 dark:text-hud-primary group-hover:scale-110 transition-transform border border-transparent dark:border-white/10
                `}>
                    <OwnerIcon name={icon} className={compact ? "w-3 h-3" : "w-4 h-4 md:w-6 md:h-6"} />
                </div>
                <div 
                    className={`flex items-center gap-1 text-[10px] md:text-xs font-bold ${trendColor} ${compact ? 'bg-transparent px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10' : 'bg-white/50 dark:bg-white/5 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full backdrop-blur-sm'}`}
                >
                    <OwnerIcon name={TrendIcon} className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span>{Math.abs(kpi.change)}%</span>
                </div>
            </div>
            <div>
                <p className={`text-gray-500 dark:text-gray-400 font-medium truncate ${compact ? 'text-[10px] uppercase tracking-wider' : 'text-xs md:text-sm'}`}>{kpi.label}</p>
                <h3 className={`${compact ? 'text-lg' : 'text-xl md:text-3xl'} font-black text-gray-900 dark:text-white mt-0.5 md:mt-1 tracking-tight drop-shadow-sm`}>{kpi.value}</h3>
                <p className={`text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mt-1 md:mt-2 truncate ${compact ? 'block' : ''}`}>{kpi.changeLabel}</p>
            </div>
        </div>
    );
};
