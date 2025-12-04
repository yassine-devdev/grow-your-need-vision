import React, { useState } from 'react';
import { OwnerIcon } from '../shared/OwnerIcons';
import { useOS } from '../../context/OSContext'; // Import OS Context

interface FooterProps {
  onLaunchApp: (appName: string) => void;
  activeApps: string[];
  isMobileSidebarOpen?: boolean;
  toggleMobileSidebar?: () => void;
}

const OwnerFooter: React.FC<FooterProps> = ({ onLaunchApp, activeApps, isMobileSidebarOpen, toggleMobileSidebar }) => {
  const { launchApp } = useOS(); // Use launchApp from Context
  const [isDockOpen, setIsDockOpen] = useState(false);

  const appConfig = [
    { name: 'Overlay Setting', icon: 'SquaresPlus', side: 'left' },
    { name: 'Platform Settings', icon: 'Cog6Tooth', side: 'left' },
    { name: 'Creator Studio', icon: 'StudioIcon3D', side: 'left' },
    { name: 'Settings', icon: 'SettingsIcon3D', side: 'left' },
    { name: 'Messaging', icon: 'MessagingIcon3D', side: 'left' },
    { name: 'Help Center', icon: 'HelpIcon3D', side: 'left' },
    { name: 'Media', icon: 'MediaIcon3D', side: 'right' },
    { name: 'Market', icon: 'MarketIcon3D', side: 'right' },
    { name: 'Services', icon: 'ServicesIcon3D', side: 'right' },
    { name: 'Activities', icon: 'ActivitiesIcon3D', side: 'right' },
    { name: 'Travel & Transport', icon: 'TransportIcon3D', side: 'right' },
    { name: 'Sport', icon: 'SportIcon3D', side: 'right' },
    { name: 'Islam', icon: 'IslamIcon3D', side: 'right' },
    { name: 'Gamification', icon: 'GamificationIcon3D', side: 'right' },
  ];

  const leftApps = appConfig.filter(app => app.side === 'left');
  const rightApps = appConfig.filter(app => app.side === 'right');

  const toggleDock = () => {
    setIsDockOpen(!isDockOpen);
  };

  return (
    <div className="shrink-0 z-40 relative flex justify-center items-end pb-1 md:pb-2">
      {/* Dock Container */}
      <div  
        className={`
            flex items-center justify-between px-4 md:px-6 relative transition-all duration-500 ease-out
            bg-white/60 dark:bg-material-gunmetal/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-hud-glow rounded-2xl
            ${isDockOpen ? 'w-[98%] md:w-[95%] max-w-6xl h-24 py-2' : 'w-[60%] md:w-[40%] min-w-[280px] md:min-w-[300px] h-12 md:h-14'}
        `}
      >
          {/* Left Side */}
          <div className="flex-1 h-full flex items-center justify-end pr-2">
            {!isDockOpen ? (
                // Collapsed Bar
                <div className="w-full h-1.5 bg-gray-200/50 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full w-1/3 bg-gradient-to-r from-gyn-blue-light to-gyn-blue-medium dark:from-hud-primary dark:to-hud-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                </div>
            ) : (
                // Expanded Icons
                <div className="flex items-center space-x-1 animate-slideInLeft overflow-x-auto no-scrollbar py-1 h-full">
                    {leftApps.map((app) => (
                        <button 
                            type="button"
                            key={app.name}
                            onClick={() => launchApp(app.name)} // Use Context
                            className="group flex flex-col items-center justify-start w-16 h-full transition-all hover:-translate-y-1 relative pt-1"
                        >
                             <div className="w-10 h-10 filter drop-shadow-lg group-hover:drop-shadow-2xl transition-all mb-1 relative">
                                <div className="absolute inset-0 bg-hud-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <OwnerIcon name={app.icon} className="w-full h-full relative z-10" />
                             </div>
                             <span className="text-[9px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-gyn-blue-dark dark:group-hover:text-hud-primary leading-tight text-center line-clamp-2 w-full drop-shadow-sm px-0.5 transition-colors">
                                {app.name}
                             </span>
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* Central Trigger */}
          <div className="shrink-0 -mt-2 relative z-20">
              <button 
                onClick={toggleDock}
                className={`
                    w-14 h-14 rounded-full border-[3px] border-white dark:border-material-gunmetal shadow-[0_5px_15px_rgba(0,0,0,0.2),inset_0_2px_5px_rgba(255,255,255,0.4)] dark:shadow-[0_0_20px_rgba(0,240,255,0.6)] flex items-center justify-center transition-all duration-300
                    bg-gradient-to-br from-gyn-blue-medium to-gyn-blue-dark dark:from-hud-primary dark:to-hud-secondary
                    ${isDockOpen ? 'rotate-90 bg-gyn-orange dark:from-gyn-orange dark:to-red-500' : 'hover:scale-110 hover:-translate-y-1'}
                `}
              >
                  <OwnerIcon name={isDockOpen ? "X" : "Grid"} className="w-7 h-7 text-white dark:text-material-obsidian drop-shadow-md" />
              </button>
          </div>

          {/* Right Side */}
          <div className="flex-1 h-full flex items-center justify-start pl-2">
             {!isDockOpen ? (
                // Collapsed Bar
                <div className="w-full h-1.5 bg-gray-200/50 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                     <div className="h-full w-1/3 ml-auto bg-gradient-to-l from-gyn-blue-light to-gyn-blue-medium dark:from-hud-primary dark:to-hud-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                </div>
             ) : (
                // Expanded Icons
                <div className="flex items-center space-x-1 animate-slideInRight overflow-x-auto no-scrollbar py-1 h-full">
                    {rightApps.map((app) => (
                        <button 
                            type="button"
                            key={app.name}
                            onClick={() => launchApp(app.name)} // Use Context
                            className="group flex flex-col items-center justify-start w-16 h-full transition-all hover:-translate-y-1 relative pt-1"
                        >
                             <div className="w-10 h-10 filter drop-shadow-lg group-hover:drop-shadow-2xl transition-all mb-1 relative">
                                <div className="absolute inset-0 bg-hud-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <OwnerIcon name={app.icon} className="w-full h-full relative z-10" />
                             </div>
                             <span className="text-[9px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-gyn-blue-dark dark:group-hover:text-hud-primary leading-tight text-center line-clamp-2 w-full drop-shadow-sm px-0.5 transition-colors">
                                {app.name}
                             </span>
                        </button>
                    ))}
                </div>
             )}
          </div>
      </div>

      {/* Mobile Sidebar Toggle - Only visible on mobile */}
      <button 
        onClick={toggleMobileSidebar}
        className="md:hidden absolute right-2 bottom-3 w-10 h-10 rounded-full bg-gray-900 dark:bg-material-obsidian shadow-lg dark:shadow-hud-glow border border-white/20 dark:border-hud-primary/50 flex items-center justify-center z-50 active:scale-95 transition-transform"
      >
        <OwnerIcon name={isMobileSidebarOpen ? "X" : "List"} className="w-5 h-5 text-white dark:text-hud-primary" />
      </button>
    </div>
  );
};

export default OwnerFooter;