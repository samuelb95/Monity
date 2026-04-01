import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { createBudget, updateBudget, getCategoriesWithHierarchy } from '../../services/supabaseService'

export default function BudgetEnvelopeModal({ isOpen, onClose, accountId, onSaved, editingBudget = null }) {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    limit_type: 'amount',
    limit_amount: '',
    alert_threshold: 80,
    period: 'monthly'
  })
  const [categoriesHierarchy, setCategoriesHierarchy] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      if (editingBudget) {
        setFormData({
          name: editingBudget.name || '',
          category_id: editingBudget.category_id || '',
          limit_type: editingBudget.limit_type || 'amount',
          limit_amount: editingBudget.limit_amount || '',
          alert_threshold: editingBudget.alert_threshold || 80,
          period: editingBudget.period || 'monthly'
        })
      } else {
        setFormData({
          name: '',
          category_id: '',
          limit_type: 'amount',
          limit_amount: '',
          alert_threshold: 80,
          period: 'monthly'
        })
      }
    }
  }, [isOpen, editingBudget])

  const loadCategories = async () => {
    try {
      const data = await getCategoriesWithHierarchy()
      // Garder uniquement les catégories de dépenses (les enveloppes sont pour les dépenses)
      setCategoriesHierarchy(data.filter(c => c.type === 'expense'))
    } catch (err) {
      console.error('Erreur chargement catégories:', err)
    }
  }

  // Quand on sélectionne une catégorie, pré-remplir le nom
  const handleCategoryChange = (categoryId) => {
    const allCats = categoriesHierarchy.flatMap(c => [c, ...c.subcategories])
    const selected = allCats.find(c => c.id === categoryId)
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      name: prev.name || (selected ? `Enveloppe ${selected.name}` : '')
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const budgetData = {
        ...formData,
        account_id: accountId,
        limit_amount: parseFloat(formData.limit_amount),
        category_id: formData.category_id || null,
        alert_threshold: parseInt(formData.alert_threshold)
      }

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData)
      } else {
        await createBudget(budgetData)
      }

      onSaved()
      onClose()
    } catch (err) {
      console.error('Erreur sauvegarde enveloppe:', err)
      setError(err.message || "Erreur lors de la sauvegarde de l'enveloppe")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingBudget ? "Modifier l'enveloppe" : 'Nouvelle enveloppe'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Catégorie parente (l'enveloppe) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie enveloppe *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Toutes dépenses confondues —</option>
              {categoriesHierarchy.map(cat => (
                <optgroup key={cat.id} label={`${cat.icon || '📁'} ${cat.name}`}>
                  <option value={cat.id}>
                    {cat.icon || '📁'} {cat.name} (toute la catégorie)
                  </option>
                  {cat.subcategories?.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      　└ {sub.icon || '•'} {sub.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {formData.category_id && (
              <p className="text-xs text-blue-600 mt-1">
                ℹ️ Les dépenses des sous-catégories seront incluses automatiquement dans cette enveloppe.
              </p>
            )}
          </div>

          {/* Nom de l'enveloppe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'enveloppe *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Enveloppe Loisirs"
            />
          </div>

          {/* Type de limite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de limite
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, limit_type: 'amount' })}
                className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                  formData.limit_type === 'amount'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                💶 Montant fixe
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, limit_type: 'percentage' })}
                className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                  formData.limit_type === 'percentage'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                📊 % des revenus
              </button>
            </div>
          </div>

          {/* Limite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.limit_type === 'amount' ? 'Montant maximum (€) *' : 'Pourcentage des revenus (%) *'}
            </label>
            <div className="relative">
              <input
                type="number"
                step={formData.limit_type === 'amount' ? '0.01' : '1'}
                min="0"
                max={formData.limit_type === 'percentage' ? '100' : undefined}
                required
                value={formData.limit_amount}
                onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder={formData.limit_type === 'amount' ? '500.00' : '20'}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {formData.limit_type === 'amount' ? '€' : '%'}
              </span>
            </div>
          </div>

          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Mensuelle</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="yearly">Annuelle</option>
            </select>
          </div>

          {/* Seuil d'alerte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alerte à {formData.alert_threshold}% du budget
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={formData.alert_threshold}
              onChange={(e) => setFormData({ ...formData, alert_threshold: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span className="font-medium text-blue-600">{formData.alert_threshold}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Enregistrement...' : editingBudget ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}