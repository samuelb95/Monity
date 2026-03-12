import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, LogOut, Menu, X, Home, BarChart3, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { useState, useRef, useEffect } from 'react';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      // Logout global Supabase (nettoie aussi les sessions OAuth)
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error('Erreur logout global:', err);
    }
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  const navigateToAccount = () => {
    navigate('/account');
    setUserMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Monity
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
                <BarChart3 className="w-4 h-4" />
                Tableau de bord
              </Link>
            </div>
          )}

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-gray-700 font-medium hidden sm:inline">{user?.email}</span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="py-2">
                      <button
                        onClick={navigateToAccount}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors font-medium text-left"
                      >
                        <User className="w-4 h-4" />
                        Mon compte
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors font-medium"
                >
                  Se connecter
                </Link>
                <Link 
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-2 rounded-md transition-all shadow-md"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t"
          >
            <div className="flex flex-col gap-4">
              {isAuthenticated && (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Tableau de bord
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors py-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link 
                    to="/login"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-md w-full transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link 
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-md w-full transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
