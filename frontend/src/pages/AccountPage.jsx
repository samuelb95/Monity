import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield,
  LogOut,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';

export const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.user_metadata?.username || user?.email?.split('@')[0] || '',
    fullName: user?.user_metadata?.full_name || '',
    notifications: true,
    dataExport: false,
  });

  const [originalData] = useState(formData);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mettre à jour les métadonnées utilisateur
      const { error } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          full_name: formData.fullName,
        }
      });

      if (error) throw error;
      
      setIsEditing(false);
      // Afficher un message de succès (à ajouter un toast)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Erreur logout:', err);
    }
  };

  const handleDeleteAccount = async () => {
    // À implémenter avec l'API backend
    console.log('Supprimer le compte');
    setShowDeleteModal(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon compte</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et vos préférences</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Profil
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{formData.fullName || formData.username}</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié directement</p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border transition-all ${
                        isEditing
                          ? 'border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                          : 'border-gray-300 bg-gray-50 text-gray-600'
                      }`}
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Votre nom complet"
                      className={`w-full px-4 py-3 rounded-lg border transition-all ${
                        isEditing
                          ? 'border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                          : 'border-gray-300 bg-gray-50 text-gray-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-75"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Security Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Sécurité
              </h2>

              <div className="space-y-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 pr-10 cursor-not-allowed"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-lg transition-colors whitespace-nowrap">
                      Changer
                    </button>
                  </div>
                </div>

                {/* Two-Factor */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Authentification à deux facteurs</h3>
                      <p className="text-sm text-gray-600">Sécurisez votre compte avec une authentification supplémentaire</p>
                    </div>
                    <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-100 font-bold rounded-lg transition-colors">
                      Configurer
                    </button>
                  </div>
                </div>

                {/* Login History */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Connexions récentes</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-900 font-medium">France, Paris</p>
                        <p className="text-gray-600">Aujourd'hui à 14:30</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Actif</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-900 font-medium">France, Lyon</p>
                        <p className="text-gray-600">Hier à 10:15</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Notifications */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notifications
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">Alertes de budget</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer opacity-50">
                  <input
                    type="checkbox"
                    disabled
                    className="w-5 h-5 text-gray-300 rounded border-gray-300 cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-600">Newsletters (à venir)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer opacity-50">
                  <input
                    type="checkbox"
                    disabled
                    className="w-5 h-5 text-gray-300 rounded border-gray-300 cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-600">Mises à jour produit (à venir)</span>
                </label>
              </div>
            </motion.div>

            {/* Data Management */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Vos données</h3>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-4 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                  Télécharger mes données
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Supprimer le compte
                </button>
              </div>
            </motion.div>

            {/* Logout */}
            <motion.button
              variants={itemVariants}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </motion.button>

            {/* Info Box */}
            <motion.div
              variants={itemVariants}
              className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Besoin d'aide?</p>
                  <p>Consultez notre documentation ou contactez notre support</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Supprimer le compte?</h3>
            <p className="text-gray-600 text-center mb-6">
              Cette action est irréversible. Toutes vos données seront supprimées définitivement.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};