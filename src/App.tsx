import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { OSProvider, useOS } from './context/OSContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import { SoundProvider } from './context/SoundContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { SchoolProvider } from './apps/school/SchoolContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navigation from './components/Navigation';
import { LoadingScreen } from './components/shared/LoadingScreen';
import { RealtimeStatus } from './components/shared/RealtimeStatus';
import { GlobalSearch } from './components/shared/GlobalSearch';
import NotFound from './components/shared/NotFound';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import TestChat from './TestChat';
import { GlobalErrorBoundary } from './components/shared/ui/GlobalErrorBoundary';

// Lazy Loaded Layouts & Pages
const LoginPage = lazy(() => import('./components/LoginPage'));
const AdminSchoolLayout = lazy(() => import('./components/layout/AdminSchoolLayout'));
const TeacherLayout = lazy(() => import('./components/layout/TeacherLayout'));
const StudentLayout = lazy(() => import('./components/layout/StudentLayout'));
const ParentLayout = lazy(() => import('./components/layout/ParentLayout'));
const IndividualLayout = lazy(() => import('./components/layout/IndividualLayout'));
const OwnerLayout = lazy(() => import('./components/layout/OwnerLayout'));

// EduMultiverse App
import { MultiverseMap } from './apps/edumultiverse/screens/MultiverseMap';
import { ParallelClassrooms } from './apps/edumultiverse/screens/ParallelClassrooms';
import { GlitchHunter } from './apps/edumultiverse/screens/GlitchHunter';
import { TimeLoopMission } from './apps/edumultiverse/screens/TimeLoopMission';
import { ConceptFusion } from './apps/edumultiverse/screens/ConceptFusion';
import { QuantumQuiz } from './apps/edumultiverse/screens/QuantumQuiz';
import { MultiverseHUD } from './apps/edumultiverse/components/MultiverseHUD';
import { Leaderboard } from './apps/edumultiverse/components/Leaderboard';

// SaaS Owner Features
import { TenantDashboard } from './apps/owner/TenantDashboard';
import { AnalyticsDashboard } from './apps/owner/AnalyticsDashboard';
import { SupportDashboard } from './apps/owner/SupportDashboard';
import { TenantOnboardingFlow } from './apps/owner/TenantOnboardingFlow';
import { OverlayAppsManager } from './apps/owner/OverlayAppsManager';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { sidebarExpanded } = useOS();
  const location = useLocation();

  // Mouse tracking for "flashlight" effect
  useEffect(() => {
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

const App: React.FC = () => {
  return (
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
  );
};

export default App;