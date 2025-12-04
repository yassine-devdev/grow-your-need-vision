import React, { Suspense, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './MainLayout';
import { NAV_CONFIG } from '../../data/AppConfigs';
import { ErrorBoundary } from '../shared/ErrorBoundary';

// Lazy load all application modules for performance
const OwnerDashboard = React.lazy(() => import('../../apps/dashboards/OwnerDashboard'));
const TenantMgt = React.lazy(() => import('../../apps/TenantMgt'));
const PlatformCRM = React.lazy(() => import('../../apps/PlatformCRM'));
const ToolPlatform = React.lazy(() => import('../../apps/ToolPlatform'));
const Communication = React.lazy(() => import('../../apps/Communication'));
const ActivitiesApp = React.lazy(() => import('../../apps/ActivitiesApp'));
const ConciergeAI = React.lazy(() => import('../../apps/ConciergeAI'));
const Wellness = React.lazy(() => import('../../apps/Wellness'));
const Tools = React.lazy(() => import('../../apps/Tools'));
const PlatformSettings = React.lazy(() => import('../../apps/PlatformSettings'));

type LoadingSpinnerProps = {
  label?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Initializing module...',
}) => (
  <div
    className="flex h-full w-full flex-col items-center justify-center gap-4 text-gray-400 dark:text-hud-primary animate-fadeIn"
    role="status"
    aria-live="polite"
  >
    <div className="relative w-14 h-14">
      {/* Outer ring */}
      <div className="absolute inset-0 border-4 border-gray-200/60 dark:border-white/10 rounded-full" />

      {/* Main spinner ring */}
      <div className="absolute inset-0 border-4 border-t-gyn-blue-medium dark:border-t-hud-primary rounded-full animate-spin shadow-[0_0_18px_rgba(0,240,255,0.55)]" />

      {/* Inner counter-rotating ring */}
      <div className="absolute inset-3 border-2 border-b-gyn-orange/80 dark:border-b-hud-secondary rounded-full animate-spin-reverse opacity-80" />

      {/* Inner pulse dot */}
      <div className="absolute inset-5 rounded-full bg-gyn-blue-medium/10 dark:bg-hud-primary/10">
        <div className="absolute inset-1 rounded-full bg-gyn-blue-medium/60 dark:bg-hud-primary/70 animate-ping" />
      </div>
    </div>

    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-semibold tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-gyn-blue-dark via-gyn-blue-medium to-gyn-blue-dark dark:from-hud-primary dark:via-hud-secondary dark:to-hud-primary animate-pulse">
        {label}
      </span>
      <span className="text-[10px] uppercase tracking-[0.22em] text-gray-400/70 dark:text-white/40">
        Optimizing widgets &amp; data views
      </span>
    </div>
  </div>
);

const UserManagement = React.lazy(() => import('../../apps/owner/UserManagement'));

const MODULE_TITLES: Record<string, string> = {
  dashboard: 'Owner Overview',
  school: 'Tenant Management',
  crm: 'Platform CRM',
  tool_platform: 'Tool Platform',
  communication: 'Communication Hub',
  activities: 'Activities & Events',
  concierge_ai: 'Concierge AI',
  wellness: 'Wellness',
  tools: 'Tools Library',
  settings: 'Platform Settings',
  users: 'User Management',
};

const formatLabel = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
};

const UnknownModule: React.FC<{ module: string }> = ({ module }) => (
  <motion.div
    className="flex h-full w-full flex-col items-center justify-center px-6 text-center"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    <div className="mb-4 inline-flex items-center justify-center rounded-full border border-dashed border-gray-300/60 dark:border-white/15 bg-white/60 dark:bg-black/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-white/60">
      Module Not Found
    </div>
    <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white">
      We couldn’t load{' '}
      <span className="font-bold text-gyn-blue-medium dark:text-hud-primary">
        {module}
      </span>
    </p>
    <p className="mt-2 max-w-md text-xs sm:text-sm text-gray-500 dark:text-white/60">
      This workspace section is not configured yet. Please verify the navigation configuration or contact an
      administrator if you believe this is an error.
    </p>
  </motion.div>
);

// Motion variants for module transitions
const moduleVariants = {
  initial: { opacity: 0, y: 8, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.995 },
};

const OwnerLayout: React.FC = () => {
  /**
   * MainLayout will call this render function and pass in
   * the current active module / tab / subnav from the OS.
   */
  const renderContent = useCallback(
    (activeModule: string, activeTab: string, activeSubNav: string) => {
      const moduleTitle = MODULE_TITLES[activeModule] ?? 'Workspace Module';
      const props = { activeTab, activeSubNav };

      const content = (() => {
        switch (activeModule) {
          case 'dashboard':
            return <OwnerDashboard />;
          case 'school': // Tenant Mgt
            return <TenantMgt {...props} />;
          case 'crm':
            return <PlatformCRM {...props} />;
          case 'tool_platform':
            return <ToolPlatform {...props} />;
          case 'communication':
            return <Communication {...props} />;
          case 'activities':
            return <ActivitiesApp {...props} />;
          case 'concierge_ai':
            return <ConciergeAI {...props} />;
          case 'wellness':
            return <Wellness {...props} />;
          case 'tools':
            return <Tools {...props} />;
          case 'settings':
            return <PlatformSettings {...props} />;
          case 'users':
            return <UserManagement />;
          default:
            return <UnknownModule module={activeModule} />;
        }
      })();

      // Key ensures motion animation when module / tab changes
      const key = `${activeModule || 'unknown'}-${activeTab || 'root'}-${activeSubNav || 'base'}`;

      return (
        <ErrorBoundary>
          <div className="flex h-full w-full flex-col bg-gradient-to-b from-slate-950/60 via-slate-950/75 to-black/90 dark:from-black/70 dark:via-slate-900/90 dark:to-black border-l border-white/5 backdrop-blur-md">
            {/* Module header / breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-black/30 px-4 py-3 sm:px-6 sm:py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400/80 dark:text-white/40">
                  Owner Workspace
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h1 className="text-lg sm:text-xl font-semibold text-white">
                    {moduleTitle}
                  </h1>
                  {(activeTab || activeSubNav) && (
                    <span className="text-xs sm:text-sm text-gray-400 dark:text-white/60">
                      /
                      {activeTab && (
                        <span className="ml-1">
                          {formatLabel(activeTab)}
                        </span>
                      )}
                      {activeSubNav && (
                        <span className="ml-1 text-gray-400/80">
                          / {formatLabel(activeSubNav)}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-gray-300/80 dark:text-white/70">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  </span>
                  <span className="uppercase tracking-[0.22em]">
                    Live session
                  </span>
                </div>
              </div>
            </div>

            {/* Module content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <Suspense
                fallback={
                  <div className="h-full w-full">
                    <LoadingSpinner label={`Loading ${moduleTitle}...`} />
                  </div>
                }
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={key}
                    // Scroll on mobile and desktop (internal scroll)
                    className="h-full w-full px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto gyn-scroll"
                    variants={moduleVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {content}
                  </motion.div>
                </AnimatePresence>
              </Suspense>
            </div>
          </div>
        </ErrorBoundary>
      );
    },
    []
  );

  return <MainLayout config={NAV_CONFIG} renderContent={renderContent} role="Owner" />;
};

export default OwnerLayout;
