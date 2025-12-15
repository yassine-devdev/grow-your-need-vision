import React, { Suspense, useLayoutEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { OSProvider, useOS } from './context/OSContext';
import { ThemeProvider } from './context/ThemeContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './context/ToastContext';
import { SoundProvider } from './context/SoundContext';
import { SchoolProvider } from './apps/school/SchoolContext';

// Components
// Components - Static (Critical)
import Navigation from './components/Navigation';
// Lazy Components
const LoginPage = React.lazy(() => import('./components/LoginPage'));
const PublicStatusPage = React.lazy(() => import('./pages/PublicStatusPage'));
import { LoadingScreen } from './components/shared/LoadingScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import { RealtimeStatus } from './components/shared/RealtimeStatus';
import { GlobalSearch } from './components/shared/GlobalSearch';
import { GlobalErrorBoundary } from './components/shared/ui/GlobalErrorBoundary';
const NotFound = React.lazy(() => import('./components/shared/NotFound'));
const TestChat = React.lazy(() => import('./TestChat'));

// Layouts - Lazy
const OwnerLayout = React.lazy(() => import('./components/layout/OwnerLayout'));
const AdminSchoolLayout = React.lazy(() => import('./components/layout/AdminSchoolLayout'));
const TeacherLayout = React.lazy(() => import('./components/layout/TeacherLayout'));
const StudentLayout = React.lazy(() => import('./components/layout/StudentLayout'));
const ParentLayout = React.lazy(() => import('./components/layout/ParentLayout'));
const IndividualLayout = React.lazy(() => import('./components/layout/IndividualLayout'));

// Owner Apps - Lazy
const TenantOnboardingFlow = React.lazy(() => import('./apps/owner/TenantOnboardingFlow').then(module => ({ default: module.TenantOnboardingFlow })));
const TenantDashboard = React.lazy(() => import('./apps/owner/TenantDashboard').then(module => ({ default: module.TenantDashboard })));
const AnalyticsDashboard = React.lazy(() => import('./apps/owner/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
const SupportDashboard = React.lazy(() => import('./apps/owner/SupportDashboard').then(module => ({ default: module.SupportDashboard })));
const OverlayAppsManager = React.lazy(() => import('./apps/owner/OverlayAppsManager').then(module => ({ default: module.OverlayAppsManager })));
import TenantMgt from './apps/TenantMgt';
import { PlatformBilling } from './apps/school/PlatformBilling';

// EduMultiverse - Lazy
import { MultiverseHUD } from './apps/edumultiverse/components/MultiverseHUD'; // HUD might need to be static or lazy loaded with routes
const MultiverseMap = React.lazy(() => import('./apps/edumultiverse/screens/MultiverseMap').then(module => ({ default: module.MultiverseMap })));
const ParallelClassrooms = React.lazy(() => import('./apps/edumultiverse/screens/ParallelClassrooms').then(module => ({ default: module.ParallelClassrooms })));
const GlitchHunter = React.lazy(() => import('./apps/edumultiverse/screens/GlitchHunter').then(module => ({ default: module.GlitchHunter })));
const TimeLoopMission = React.lazy(() => import('./apps/edumultiverse/screens/TimeLoopMission').then(module => ({ default: module.TimeLoopMission })));
const ConceptFusion = React.lazy(() => import('./apps/edumultiverse/screens/ConceptFusion').then(module => ({ default: module.ConceptFusion })));
const QuantumQuiz = React.lazy(() => import('./apps/edumultiverse/screens/QuantumQuiz').then(module => ({ default: module.QuantumQuiz })));
const Leaderboard = React.lazy(() => import('./apps/edumultiverse/components/Leaderboard').then(module => ({ default: module.Leaderboard })));

import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { FeedbackWidget } from './components/shared/FeedbackWidget';
import { PWAInstallPrompt } from './components/shared/PWAInstallPrompt';
import { ImpersonationBanner } from './components/shared/ImpersonationBanner';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { sidebarExpanded } = useOS();
  const location = useLocation();

  useKeyboardShortcuts();

  useLayoutEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isAuthPage = location.pathname === '/login';
  const isOwnerRoute = location.pathname.includes('/admin') || location.hash.includes('/admin');

  // Routes that use MainLayout and should take up the full screen (no global sidebar/margin)
  const isFullScreenRoute = ['/admin', '/school-admin', '/teacher', '/student', '/parent', '/individual'].some(path => location.pathname.startsWith(path));

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-gyn-blue-medium/30 ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>

      {isOwnerRoute && (
        <div className="fixed top-2 left-2 z-[70] text-[10px] font-black text-gray-600 bg-white/90 border border-gray-200 px-3 py-1 rounded uppercase tracking-[0.35em] shadow-sm">
          OWNER CONTROL
        </div>
      )}

      {/* Navigation is hidden on login page and full screen routes */}
      {!isAuthPage && !isFullScreenRoute && user && <Navigation />}

      <main className={`transition-all duration-300 ease-in-out ${!isAuthPage && !isFullScreenRoute && user ? (sidebarExpanded ? 'ml-64' : 'ml-20') : ''}`}>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/status" element={<PublicStatusPage />} />
            <Route path="/signup" element={<TenantOnboardingFlow />} />

            {/* Protected Routes */}

            {/* 1. OWNER (Super Admin) */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <OwnerLayout />
              </ProtectedRoute>
            } />

            {/* Direct owner module routes for hash/deep links */}
            <Route path="/admin/school" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <TenantMgt activeTab="Tenants" activeSubNav="Schools" />
              </ProtectedRoute>
            } />
            <Route path="/admin/school/billing" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <PlatformBilling activeSubNav="Plans" />
              </ProtectedRoute>
            } />

            {/* OWNER SAAS FEATURES - Standalone Routes */}
            <Route path="/owner/tenants" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <TenantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/owner/analytics" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/owner/support" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <SupportDashboard />
              </ProtectedRoute>
            } />
            <Route path="/owner/overlay-apps" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <OverlayAppsManager />
              </ProtectedRoute>
            } />

            {/* 2. SCHOOL ADMIN */}
            <Route path="/school-admin/*" element={
              <ProtectedRoute allowedRoles={['Admin', 'Owner', 'SchoolAdmin']}>
                <SchoolProvider>
                  <AdminSchoolLayout />
                </SchoolProvider>
              </ProtectedRoute>
            } />

            {/* 3. TEACHER */}
            <Route path="/teacher/*" element={
              <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'Owner']}>
                <TeacherLayout />
              </ProtectedRoute>
            } />

            {/* 4. STUDENT */}
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['Student', 'Admin', 'Owner']}>
                <StudentLayout />
              </ProtectedRoute>
            } />

            {/* 5. PARENT */}
            <Route path="/parent/*" element={
              <ProtectedRoute allowedRoles={['Parent', 'Admin', 'Owner']}>
                <ParentLayout />
              </ProtectedRoute>
            } />

            {/* 6. INDIVIDUAL */}
            <Route path="/individual/*" element={
              <ProtectedRoute allowedRoles={['Individual', 'Owner']}>
                <IndividualLayout />
              </ProtectedRoute>
            } />

            {/* EDUMULTIVERSE ADD-ON */}
            <Route path="/apps/edumultiverse/*" element={
              <MultiverseHUD>
                <Routes>
                  <Route path="/" element={<MultiverseMap />} />
                  <Route path="/universe/:universeId" element={<ParallelClassrooms />} />
                  <Route path="/glitch-hunter" element={<GlitchHunter />} />
                  <Route path="/time-loop" element={<TimeLoopMission />} />
                  <Route path="/concept-fusion" element={<ConceptFusion />} />
                  <Route path="/quantum-quiz" element={<QuantumQuiz />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                </Routes>
              </MultiverseHUD>
            } />

            {/* Test Route */}
            <Route path="/test-chat" element={<TestChat />} />

            {/* Default Redirect */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global Realtime Status Indicator */}
      {user && <RealtimeStatus />}
      {user && <GlobalSearch />}
      <FeedbackWidget />
      <PWAInstallPrompt />
      <ImpersonationBanner />
    </div>
  );
};

// React Query
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

const App: React.FC = () => {
  // Normalize direct path navigation (/login, /admin, etc.) into hash-based routing for tests
  React.useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      if (navigator.webdriver || import.meta.env.MODE === 'test') {
        (window as any).__E2E_MOCK__ = true;
      }

      if (!window.location.hash && window.location.pathname && window.location.pathname !== '/') {
        const normalized = window.location.pathname.startsWith('/')
          ? window.location.pathname
          : `/${window.location.pathname}`;
        window.location.hash = normalized;
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <RealtimeProvider>
            <ThemeProvider>
              <OSProvider>
                <ToastProvider>
                  <ModalProvider>
                    <SoundProvider>
                      <GlobalErrorBoundary>
                        <AppContent />
                      </GlobalErrorBoundary>
                    </SoundProvider>
                  </ModalProvider>
                </ToastProvider>
              </OSProvider>
            </ThemeProvider>
          </RealtimeProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;