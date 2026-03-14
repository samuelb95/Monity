import { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../config/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est connecté au chargement et écouter les changements
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attendre que Supabase traite le callback OAuth (s'il y en a un)
        // Le fragment d'URL (#access_token=...) est traité automatiquement par Supabase
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Récupérer l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔐 Utilisateur récupéré:', user?.email);
        if (user) {
          setUser(user);
        } else {
          console.log('⚠️ Pas d\'utilisateur trouvé');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const register = useCallback(async (email, password, firstName, lastName) => {
    try {
      setError(null);
      const result = await authService.signUp(email, password, firstName, lastName);
      if (result.success) {
        setUser(result.data.user);
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const result = await authService.signIn(email, password);
      if (result.success) {
        setUser(result.data.user);
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
