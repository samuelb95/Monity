import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Common/Navbar';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlannerPage } from './pages/PlannerPage';
import { ForecastPage } from './pages/ForecastPage';
import { AccountPage } from './pages/AccountPage';
import { GroupsPage } from './pages/GroupsPage';

// Component interne pour la navigation
function AppContent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = (type = 'login') => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate(type === 'register' ? '/register' : '/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
      <Routes>
        {/* Landing page pour les non-authentifiés */}
        <Route 
          path="/" 
          element={
            !isAuthenticated ? (
              <LandingPage onGetStarted={handleGetStarted} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* Login */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <AuthPage onBackToHome={() => navigate('/')} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* Register */}
        <Route 
          path="/register" 
          element={
            !isAuthenticated ? (
              <AuthPage onBackToHome={() => navigate('/')} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* OAuth Callback */}
        <Route 
          path="/auth/callback" 
          element={<AuthCallbackPage />}
        />

        {/* Pages protégées */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Navbar />
              <main>
                <DashboardPage />
              </main>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <Navbar />
              <main>
                <PlannerPage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forecast"
          element={
            <ProtectedRoute>
              <Navbar />
              <main>
                <ForecastPage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Navbar />
              <main>
                <GroupsPage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute>
              <Navbar />
              <main>
                <AccountPage />
              </main>
            </ProtectedRoute>
          } 
        />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
