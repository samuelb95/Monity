import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Common/Navbar';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { supabase } from './config/supabase';

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
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Gérer le callback OAuth et redirection après authentification
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Vérifier si c'est un callback OAuth
      if (hash.includes('access_token') || searchParams.has('code')) {
        console.log('🔐 OAuth callback détecté');
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Attendre plus longtemps que Supabase traite le callback
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { user }, error } = await supabase.auth.getUser();
          console.log(`📊 Tentative ${attempts + 1}: user=${!!user}, error=${error?.message || 'none'}`);
          
          if (user) {
            console.log('✅ Utilisateur détecté, redirection vers dashboard');
            navigate('/dashboard');
            return;
          }
          attempts++;
        }
        
        console.log('⚠️ Pas d\'utilisateur après ' + maxAttempts + ' tentatives');
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  // Rediriger vers dashboard si authentifié
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ Utilisateur authentifié detected, redirection');
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

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
