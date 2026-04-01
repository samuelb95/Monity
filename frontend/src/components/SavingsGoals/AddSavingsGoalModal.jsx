import { useState } from 'react'
import { createSavingsGoal } from '../../services/supabaseService'

export default function AddSavingsGoalModal({ isOpen, onClose, accountId, onGoalAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    target_date: '',
    color: '#4CAF50',
    icon: '🎯',
    description: '',
    is_physical: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const iconOptions = ['🎯', '💰', '🏠', '🚗', '✈️', '🎓', '💍', '🎁', '🏖️', '📱', '💻', '🎮']
  const colorOptions = [
    { name: 'Vert', value: '#4CAF50' },
    { name: 'Bleu', value: '#2196F3' },
    { name: 'Orange', value: '#FF9800' },
    { name: 'Violet', value: '#9C27B0' },
    { name: 'Rose', value: '#E91E63' },
    { name: 'Rouge', value: '#F44336' },
    { name: 'Cyan', value: '#00BCD4' },
    { name: 'Indigo', value: '#3F51B5' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const goalData = {
        ...formData,
        account_id: accountId,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount),
        target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null
      }

      const newGoal = await createSavingsGoal(goalData)
      onGoalAdded(newGoal)
      handleClose()
    } catch (err) {
      console.error('Erreur création objectif:', err)
      setError(err.message || "Erreur lors de la création de l'objectif")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '0',
      target_date: '',
      color: '#4CAF50',
      icon: '🎯',
      description: '',
      is_physical: false
    })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Nouvel Objectif d'Épargne</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom de l'objectif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'objectif *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Vacances, Voiture, Maison..."
            />
          </div>

          {/* Icône */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icône
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-3 text-2xl rounded-lg border-2 transition hover:scale-110 ${
                    formData.icon === icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`p-3 rounded-lg border-2 transition ${
                    formData.color === color.value
                      ? 'border-gray-800 scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <span className="text-white text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Montant objectif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant objectif (EUR) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Montant actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant déjà économisé (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.current_amount}
              onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Date objectif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date objectif (optionnel)
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Pourquoi économisez-vous pour cet objectif ?"
            />
          </div>

          {/* Type d'épargne */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Où est l'argent ?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_physical: false })}
                className={`p-3 rounded-lg border-2 text-left transition ${
                  !formData.is_physical
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xl mb-1">💜</div>
                <div className="text-sm font-medium text-gray-800">Réserve virtuelle</div>
                <div className="text-xs text-gray-500 mt-1">L'argent reste sur mon compte courant, juste "mis de côté" mentalement</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_physical: true })}
                className={`p-3 rounded-lg border-2 text-left transition ${
                  formData.is_physical
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xl mb-1">🏦</div>
                <div className="text-sm font-medium text-gray-800">Épargne physique</div>
                <div className="text-xs text-gray-500 mt-1">L'argent est viré sur un compte épargne ou retiré en cash</div>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {formData.is_physical
                ? '🏦 Physique : votre solde bancaire est déjà impacté. Monity ne déduit pas à nouveau cet argent.'
                : '💜 Virtuel : l\'argent est encore sur votre compte. Monity le déduit pour calculer votre solde disponible réel.'
              }
            </p>
          </div>

          {/* Aperçu */}
          {formData.target_amount && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu</h3>
              <div 
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: formData.color }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{formData.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{formData.name || 'Nouvel objectif'}</p>
                    <p className="text-sm opacity-90">
                      {parseFloat(formData.current_amount || 0).toFixed(2)} € / {parseFloat(formData.target_amount).toFixed(2)} €
                    </p>
                  </div>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ 
                      width: `${Math.min(100, (parseFloat(formData.current_amount || 0) / parseFloat(formData.target_amount)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}