import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocalizationProvider } from './contexts/LocalizationContext';
import { ChildrenProvider } from './contexts/ChildrenContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { AdminRoute } from './components/admin/AdminRoute';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ChildProfile } from './components/profile/ChildProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HealthHub } from './components/health/HealthHub';
import { SettingsHub } from './components/settings/SettingsHub';
import { MultimediaHub } from './components/multimedia/MultimediaHub';
import { useChildren } from './contexts/ChildrenContext';
import { TestProvider } from './contexts/TestContext';
import { useAuth } from './hooks/useAuth';
import { ChildSelector } from './components/children/ChildSelector';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { DashboardErrorBoundary } from './components/dashboard/DashboardErrorBoundary';
import { useFCMNotifications } from './hooks/useFCMNotifications';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Route debugging component
const RouteDebugger: React.FC = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    console.log('Current route:', location.pathname);
  }, [location]);
  
  return null;
};

function App() {
  useFCMNotifications();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <LocalizationProvider>
            <ChildrenProvider>
              <TestProvider>
                <Router>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <OfflineIndicator />
                    {process.env.NODE_ENV === 'development' && <RouteDebugger />}
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route
                        path="/admin/*"
                        element={
                          <AdminRoute>
                            <Navbar />
                            <AdminDashboard />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/*"
                        element={
                          <AuthGuard>
                            <AppContent />
                          </AuthGuard>
                        }
                      />
                    </Routes>
                  </div>
                </Router>
              </TestProvider>
            </ChildrenProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

const AppContent: React.FC = () => {
  const { isAdmin } = useAuth();
  const { children } = useChildren();

  return (
    <>
      <Navbar />
      {children.length > 0 && (
        <div className="pt-4 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <ChildSelector />
        </div>
      )}
      <Routes>
        <Route path="/" element={
          isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="/dashboard" element={
          isAdmin ? <Navigate to="/admin" replace /> : (
            <DashboardErrorBoundary>
              <Dashboard />
            </DashboardErrorBoundary>
          )
        } />
        <Route path="/health/*" element={<HealthHub />} />
        <Route path="/profile" element={<ChildProfile />} />
        <Route path="/settings" element={<SettingsHub />} />
        <Route path="/multimedia" element={<MultimediaHub />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Page not found</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        } />
      </Routes>
    </>
  );
};

export default App;