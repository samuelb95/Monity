import { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../config/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Écouter les changements d'authentification Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, 'user:', session?.user?.email);
      if (isMounted) {
        if (session?.user) {
          console.log('✅ Session trouvée:', session.user.email);
          setUser(session.user);
        } else {
          console.log('⚠️ Pas de session');
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
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