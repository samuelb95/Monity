import { useState, useEffect } from 'react'
import { createTransaction, getCategoriesWithHierarchy, getSavingsGoals } from '../../services/supabaseService'

export default function AddTransactionModal({ isOpen, onClose, accountId, onTransactionAdded }) {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    description: '',
    category_id: '',
    savings_goal_id: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurrence_pattern: 'monthly',
    recurrence_end_date: '',
    notes: ''
  })
  const [categoriesHierarchy, setCategoriesHierarchy] = useState([])
  const [savingsGoals, setSavingsGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      loadSavingsGoals()
    }
  }, [isOpen])

  const loadCategories = async () => {
    try {
      const data = await getCategoriesWithHierarchy()
      setCategoriesHierarchy(data)
    } catch (err) {
      console.error('Erreur chargement catégories:', err)
    }
  }

  const loadSavingsGoals = async () => {
    try {
      const data = await getSavingsGoals(accountId)
      setSavingsGoals(data)
    } catch (err) {
      console.error('Erreur chargement objectifs:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const transactionData = {
        ...formData,
        account_id: accountId,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        category_id: formData.savings_goal_id ? null : (formData.category_id || null),
        savings_goal_id: formData.savings_goal_id || null,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null
      }

      const newTransaction = await createTransaction(transactionData)
      onTransactionAdded(newTransaction)
      handleClose()
    } catch (err) {
      console.error('Erreur création transaction:', err)
      setError(err.message || 'Erreur lors de la création de la transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      amount: '',
      type: 'expense',
      description: '',
      category_id: '',
      savings_goal_id: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurrence_pattern: 'monthly',
      recurrence_end_date: '',
      notes: ''
    })
    setError('')
    onClose()
  }

  const selectedGoal = savingsGoals.find(g => g.id === formData.savings_goal_id)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Nouvelle Transaction</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de transaction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de transaction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', savings_goal_id: '' })}
                className={`p-3 rounded-lg border-2 transition ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-1 block">💸</span>
                Dépense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', savings_goal_id: '' })}
                className={`p-3 rounded-lg border-2 transition ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-1 block">💰</span>
                Revenu
              </button>
            </div>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (EUR) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Courses, Loyer, Salaire..."
            />
          </div>

          {/* Catégorie / Objectif d'épargne */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie / Objectif d'épargne
            </label>
            <select
              value={formData.savings_goal_id ? `goal:${formData.savings_goal_id}` : formData.category_id}
              onChange={(e) => {
                const val = e.target.value
                if (val.startsWith('goal:')) {
                  setFormData({ ...formData, savings_goal_id: val.replace('goal:', ''), category_id: '' })
                } else {
                  setFormData({ ...formData, category_id: val, savings_goal_id: '' })
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sans catégorie</option>

              {/* Objectifs d'épargne */}
              {formData.type === 'expense' && savingsGoals.length > 0 && (
                <optgroup label="🎯 Objectifs d'épargne">
                  {savingsGoals.map(goal => {
                    const pct = goal.target_amount > 0
                      ? Math.round((goal.current_amount / goal.target_amount) * 100)
                      : 0
                    return (
                      <option key={goal.id} value={`goal:${goal.id}`}>
                        {goal.icon || '🎯'} {goal.name} — {pct}% atteint
                        {!goal.is_physical ? ' (virtuel)' : ' (physique)'}
                      </option>
                    )
                  })}
                </optgroup>
              )}

              {/* Catégories standard */}
              {categoriesHierarchy
                .filter(cat => cat.type === formData.type)
                .map(parent => (
                  parent.subcategories && parent.subcategories.length > 0 ? (
                    <optgroup key={parent.id} label={`${parent.icon || '📁'} ${parent.name}`}>
                      <option value={parent.id}>
                        {parent.icon || '📁'} {parent.name} (général)
                      </option>
                      {parent.subcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          　└ {sub.icon || '•'} {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <option key={parent.id} value={parent.id}>
                      {parent.icon || '📁'} {parent.name}
                    </option>
                  )
                ))}
            </select>

            {/* Info contextuelle objectif sélectionné */}
            {selectedGoal && (
              <div className={`mt-2 p-2 rounded-lg text-xs ${selectedGoal.is_physical ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                {selectedGoal.is_physical
                  ? '🏦 Épargne physique — ajoutée comme dépense, le solde bancaire est déjà impacté.'
                  : '💜 Réserve virtuelle — ajoutée comme dépense, déduite du solde disponible uniquement.'
                }
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Transaction récurrente */}
          <div className="border-t pt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Transaction récurrente
              </span>
            </label>
          </div>

          {formData.is_recurring && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fréquence
                </label>
                <select
                  value={formData.recurrence_pattern}
                  onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                  <option value="quarterly">Trimestrielle</option>
                  <option value="yearly">Annuelle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin (optionnel)
                </label>
                <input
                  type="date"
                  value={formData.recurrence_end_date}
                  onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                  min={formData.date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide pour une récurrence indéfinie
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Informations supplémentaires..."
            />
          </div>

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