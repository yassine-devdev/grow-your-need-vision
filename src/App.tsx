import React, { Suspense, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

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
import Navigation from './components/Navigation';
import LoginPage from './components/LoginPage';
import { LoadingScreen } from './components/shared/LoadingScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import { RealtimeStatus } from './components/shared/RealtimeStatus';
import { GlobalSearch } from './components/shared/GlobalSearch';
import { GlobalErrorBoundary } from './components/shared/ui/GlobalErrorBoundary';
import NotFound from './components/shared/NotFound';
import TestChat from './TestChat';

// Layouts
import OwnerLayout from './components/layout/OwnerLayout';
import AdminSchoolLayout from './components/layout/AdminSchoolLayout';
import TeacherLayout from './components/layout/TeacherLayout';
import StudentLayout from './components/layout/StudentLayout';
import ParentLayout from './components/layout/ParentLayout';
import IndividualLayout from './components/layout/IndividualLayout';

// Owner Apps
import { TenantOnboardingFlow } from './apps/owner/TenantOnboardingFlow';
import { TenantDashboard } from './apps/owner/TenantDashboard';
import { AnalyticsDashboard } from './apps/owner/AnalyticsDashboard';
import { SupportDashboard } from './apps/owner/SupportDashboard';
import { OverlayAppsManager } from './apps/owner/OverlayAppsManager';

// EduMultiverse
import { MultiverseHUD } from './apps/edumultiverse/components/MultiverseHUD';
import { MultiverseMap } from './apps/edumultiverse/screens/MultiverseMap';
import { ParallelClassrooms } from './apps/edumultiverse/screens/ParallelClassrooms';
import { GlitchHunter } from './apps/edumultiverse/screens/GlitchHunter';
import { TimeLoopMission } from './apps/edumultiverse/screens/TimeLoopMission';
import { ConceptFusion } from './apps/edumultiverse/screens/ConceptFusion';
import { QuantumQuiz } from './apps/edumultiverse/screens/QuantumQuiz';
import { Leaderboard } from './apps/edumultiverse/components/Leaderboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { sidebarExpanded } = useOS();
  const location = useLocation();

  useLayoutEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isAuthPage = location.pathname === '/login';

  // Routes that use MainLayout and should take up the full screen (no global sidebar/margin)
  const isFullScreenRoute = ['/admin', '/school-admin', '/teacher', '/student', '/parent', '/individual'].some(path => location.pathname.startsWith(path));

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-gyn-blue-medium/30 ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>

      {/* Navigation is hidden on login page and full screen routes */}
      {!isAuthPage && !isFullScreenRoute && user && <Navigation />}

      <main className={`transition-all duration-300 ease-in-out ${!isAuthPage && !isFullScreenRoute && user ? (sidebarExpanded ? 'ml-64' : 'ml-20') : ''}`}>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<TenantOnboardingFlow />} />

            {/* Protected Routes */}

            {/* 1. OWNER (Super Admin) */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <OwnerLayout />
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
              <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
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
    </div>
  );
};

// React Query
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

const App: React.FC = () => {
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