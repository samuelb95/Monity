import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Attendre que le contexte détecte l'authentification
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        console.log('✅ Utilisateur authentifié via OAuth, redirection vers dashboard');
        navigate('/dashboard');
      } else {
        console.log('⚠️ Pas d\'utilisateur après callback, redirection vers login');
        navigate('/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6"
        >
          <Wallet className="w-8 h-8 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Authentification en cours...
        </h1>
        <p className="text-gray-600">
          Veuillez patienter, nous finalisons votre connexion.
        </p>
      </motion.div>
    </div>
  );
};