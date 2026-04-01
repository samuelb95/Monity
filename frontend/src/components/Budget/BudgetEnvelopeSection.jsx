import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Plus, Edit2, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { deleteBudget, getDescendantCategoryIds } from '../../services/supabaseService'
import BudgetEnvelopeModal from './BudgetEnvelopeModal'

export default function BudgetEnvelopeSection({
  budgets,
  allCategories,
  filteredTransactions,
  totalIncome,
  accountId,
  onRefresh
}) {
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [expandedBudget, setExpandedBudget] = useState(null)

  // Calculer la limite effective (en € si pourcentage)
  const getEffectiveLimit = (budget) => {
    if (budget.limit_type === 'percentage') {
      return (budget.limit_amount / 100) * totalIncome
    }
    return budget.limit_amount || 0
  }

  // Calculer les dépenses pour un budget, incluant les sous-catégories
  const getEnvelopeStats = (budget) => {
    const effectiveLimit = getEffectiveLimit(budget)

    // Si pas de catégorie définie => toutes les dépenses
    if (!budget.category_id) {
      const spent = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
      const percentage = effectiveLimit > 0 ? (spent / effectiveLimit) * 100 : 0
      return { spent, effectiveLimit, percentage, subcategoryBreakdown: [] }
    }

    // Récupérer tous les IDs descendants (catégorie + sous-catégories)
    const allCategoryIds = getDescendantCategoryIds(budget.category_id, allCategories)

    // Calculer les dépenses par (sous-)catégorie
    const breakdown = allCategoryIds.map(catId => {
      const cat = allCategories.find(c => c.id === catId)
      const catTransactions = filteredTransactions.filter(
        t => t.type === 'expense' && t.category_id === catId
      )
      const catSpent = catTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      return {
        category: cat,
        spent: catSpent,
        transactionCount: catTransactions.length,
        isParent: catId === budget.category_id
      }
    }).filter(b => b.spent > 0 || b.isParent)

    const spent = breakdown.reduce((sum, b) => sum + b.spent, 0)
    const percentage = effectiveLimit > 0 ? (spent / effectiveLimit) * 100 : 0

    return { spent, effectiveLimit, percentage, subcategoryBreakdown: breakdown }
  }

  const handleDelete = async (budgetId) => {
    if (!confirm('Supprimer cette enveloppe budgétaire ?')) return
    try {
      await deleteBudget(budgetId)
      onRefresh()
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  const getBarColor = (percentage, alertThreshold) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= alertThreshold) return 'bg-orange-400'
    return 'bg-blue-500'
  }

  const getStatusColor = (percentage, alertThreshold) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= alertThreshold) return 'text-orange-500'
    return 'text-green-600'
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/78 shadow-[0_28px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <PieChart className="w-5 h-5 text-blue-600" />
          Enveloppes budgétaires
        </h2>
        <button
          onClick={() => { setEditingBudget(null); setShowModal(true) }}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
        >
          <Plus className="w-4 h-4" />
          Nouvelle enveloppe
        </button>
      </div>

      {/* Liste des enveloppes */}
      <div className="bg-white/35 p-6">
        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <PieChart className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">Aucune enveloppe définie</p>
            <p className="text-sm text-gray-500 mb-4">
              Créez des enveloppes pour suivre vos dépenses par catégorie
            </p>
            <button
              onClick={() => { setEditingBudget(null); setShowModal(true) }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Créer une enveloppe
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget, index) => {
              const { spent, effectiveLimit, percentage, subcategoryBreakdown } = getEnvelopeStats(budget)
              const isExpanded = expandedBudget === budget.id
              const isOverBudget = percentage >= 100
              const isNearLimit = percentage >= (budget.alert_threshold || 80)
              const hasSubs = subcategoryBreakdown.filter(b => !b.isParent).length > 0

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`overflow-hidden rounded-2xl border-2 transition-colors ${
                    isOverBudget ? 'border-red-200 bg-red-50/90' :
                    isNearLimit ? 'border-orange-200 bg-orange-50/90' :
                    'border-slate-200 bg-white/95'
                  }`}
                >
                  {/* Ligne principale */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                          {isOverBudget && (
                            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              <AlertTriangle className="w-3 h-3" />
                              Dépassé
                            </span>
                          )}
                          {!isOverBudget && isNearLimit && (
                            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                              <AlertTriangle className="w-3 h-3" />
                              Attention
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {budget.limit_type === 'percentage'
                            ? `${budget.limit_amount}% des revenus → ${`${effectiveLimit.toFixed(2)}€`}`
                            : budget.period === 'monthly' ? 'Mensuel' : budget.period === 'weekly' ? 'Hebdomadaire' : 'Annuel'
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <span className={`text-sm font-bold ${getStatusColor(percentage, budget.alert_threshold || 80)}`}>
                          {percentage.toFixed(0)}%
                        </span>
                        <button
                          onClick={() => { setEditingBudget(budget); setShowModal(true) }}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Montants */}
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        {`${spent.toFixed(2)}€` } dépensé
                      </span>
                      <span className="text-gray-500">
                        limite: { `${effectiveLimit.toFixed(2)}€`}
                      </span>
                    </div>

                    {/* Barre de progression */}
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className={`h-full rounded-full transition-colors ${getBarColor(percentage, budget.alert_threshold || 80)}`}
                      />
                    </div>

                    {/* Reste */}
                    <div className="flex justify-between mt-2">
                      <span className={`text-xs font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                        {isOverBudget
                          ? `⚠️ Dépassement: ${(spent - effectiveLimit).toFixed(2)}€`
                          :`Reste: ${(effectiveLimit - spent).toFixed(2)}€`
                        }
                      </span>
                      {hasSubs && (
                        <button
                          onClick={() => setExpandedBudget(isExpanded ? null : budget.id)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? 'Masquer' : 'Détail par sous-catégorie'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Détail sous-catégories */}
                  <AnimatePresence>
                    {isExpanded && hasSubs && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-200 bg-slate-50/60"
                      >
                        <div className="p-4 space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Répartition par sous-catégorie
                          </p>
                          {subcategoryBreakdown
                            .filter(b => !b.isParent || b.spent > 0)
                            .sort((a, b) => b.spent - a.spent)
                            .map(item => (
                              <div key={item.category?.id || 'unknown'} className="flex items-center gap-3">
                                <span className="text-sm w-6 text-center">
                                  {item.category?.icon || (item.isParent ? '📁' : '•')}
                                </span>
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className={`font-medium ${item.isParent ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {item.isParent ? item.category?.name : `└ ${item.category?.name}`}
                                    </span>
                                    <span className="text-gray-600">
                                      {`${item.spent.toFixed(2)}€`}
                                      <span className="text-gray-400 ml-1 text-xs">
                                        ({spent > 0 ? ((item.spent / spent) * 100).toFixed(0) : 0}%)
                                      </span>
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${spent > 0 ? Math.min((item.spent / spent) * 100, 100) : 0}%`,
                                        backgroundColor: item.category?.color || '#6366f1'
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <BudgetEnvelopeModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingBudget(null) }}
        accountId={accountId}
        editingBudget={editingBudget}
        onSaved={onRefresh}
      />
    </div>
  )
}
