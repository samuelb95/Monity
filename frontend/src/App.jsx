import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Common/Navbar';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './pages/AuthPage';

// Pages (à implémenter)
const DashboardPage = () => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Tableau de bord</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Dashboard en cours de développement...</p>
    </div>
  </div>
);

const AccountsPage = () => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Comptes</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Gestion des comptes en cours de développement...</p>
    </div>
  </div>
);

// Component interne pour la navigation
function AppContent() {
  const { isAuthenticated } = useAuth();

  const handleGetStarted = (type = 'login') => {
    // Rediriger selon l'état d'authentification
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = type === 'register' ? '/register' : '/login';
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
              <AuthPage onBackToHome={() => window.location.href = '/'} />
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
              <AuthPage onBackToHome={() => window.location.href = '/'} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
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
          path="/accounts" 
          element={
            <ProtectedRoute>
              <Navbar />
              <main>
                <AccountsPage />
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
