import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowLeft } from 'lucide-react';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { ForgotPasswordForm } from '../components/Auth/ForgotPasswordForm';

export const AuthPage = ({ onBackToHome }) => {
  const [currentForm, setCurrentForm] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleToggleForm = (form) => {
    setCurrentForm(form);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Simulated API call - à remplacer avec Supabase
      console.log('Form submission:', data);
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (data.type === 'email') {
        if (currentForm === 'login') {
          setMessage({ type: 'success', text: 'Connexion réussie!' });
          // Redirect to dashboard after success
          setTimeout(() => {
            // Navigate to dashboard
            window.location.href = '/dashboard';
          }, 1000);
        } else if (currentForm === 'register') {
          setMessage({ type: 'success', text: 'Compte créé avec succès!' });
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      } else if (data.type === 'oauth') {
        setMessage({ type: 'success', text: `Connexion avec ${data.provider} en cours...` });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else if (data.type === 'forgot') {
        setMessage({ type: 'success', text: 'Email de réinitialisation envoyé!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pt-6 px-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Monity
            </span>
          </div>
          
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Side - Info Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="space-y-8">
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    Bienvenue dans <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Monity</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Prenez le contrôle de votre budget, planifiez vos objectifs et vivez sans stress financier.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Gestion Simple</h3>
                      <p className="text-gray-600">Trois catégories pour organiser vos dépenses : Charge, Épargne et Loisir</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Budget Partagé</h3>
                      <p className="text-gray-600">Gérez vos finances à plusieurs et clarifiez les dépenses communes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Suivi en Temps Réel</h3>
                      <p className="text-gray-600">Visualisez vos dépenses avec des graphiques clairs et détaillés</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Objectifs d'Épargne</h3>
                      <p className="text-gray-600">Définissez et suivez vos objectifs avec motivation et clarté</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">💳 100% sécurisé • 🔒 Vos données vous appartiennent • ✨ Gratuit pour toujours</p>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form Section */}
            <motion.div
              key={currentForm}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {/* Messages */}
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-full max-w-md mb-6 p-4 rounded-lg font-medium text-center ${
                    message.type === 'success'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}

              {/* Forms */}
              {currentForm === 'login' && (
                <LoginForm
                  onToggleForm={handleToggleForm}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}
              {currentForm === 'register' && (
                <RegisterForm
                  onToggleForm={handleToggleForm}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}
              {currentForm === 'forgot' && (
                <ForgotPasswordForm
                  onToggleForm={handleToggleForm}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}

              {/* Footer Text */}
              <p className="text-center text-gray-500 text-xs mt-6 max-w-md">
                En continuant, vous acceptez nos <span className="text-gray-600 font-medium">conditions d'utilisation</span> et notre <span className="text-gray-600 font-medium">politique de confidentialité</span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};