import { supabase } from '../config/supabase';

export const authService = {
  // Inscription avec email/mot de passe
  async signUp(email, password, firstName, lastName) {
    try {
      console.log('🔄 Tentative d\'inscription:', { email, firstName, lastName });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
          },
        },
      });

      if (error) {
        console.error('❌ Erreur inscription:', error);
        throw error;
      }
      console.log('✅ Inscription réussie:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception inscription:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Connexion avec email/mot de passe
  async signIn(email, password) {
    try {
      console.log('🔄 Tentative de connexion:', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erreur connexion:', error);
        throw error;
      }
      console.log('✅ Connexion réussie:', data.user?.email);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception connexion:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Connexion avec Google
  async signInWithGoogle() {
    try {
      console.log('🔄 Tentative de connexion Google');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ Erreur Google OAuth:', error);
        throw error;
      }
      console.log('✅ Redirection Google en cours');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception Google OAuth:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Connexion avec Facebook
  async signInWithFacebook() {
    try {
      console.log('🔄 Tentative de connexion Facebook');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ Erreur Facebook OAuth:', error);
        throw error;
      }
      console.log('✅ Redirection Facebook en cours');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception Facebook OAuth:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Réinitialiser le mot de passe
  async resetPassword(email) {
    try {
      console.log('🔄 Tentative de réinitialisation:', { email });
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('❌ Erreur réinitialisation:', error);
        throw error;
      }
      console.log('✅ Email de réinitialisation envoyé');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception réinitialisation:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Déconnexion
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};