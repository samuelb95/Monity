import { supabase } from '../config/supabase'
import { encryptData, decryptData } from './encryptionService'

// ============ ACCOUNTS ============
export async function getAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createAccount(accountData) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('accounts')
    .insert([
      {
        user_id: user.id,
        name: accountData.name,
        type: accountData.type || 'personal',
        current_balance: accountData.current_balance || 0,
        currency: accountData.currency || 'EUR'
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

// ============ TRANSACTIONS ============
export async function getTransactions(accountId) {
  // Si pas d'accountId, retourner tableau vide
  if (!accountId) {
    return []
  }

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories:transaction_categories(*)
    `)
    .eq('account_id', accountId)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTransaction(transactionData) {
  const { data: { user } } = await supabase.auth.getUser()

  const payload = {
    account_id: transactionData.account_id,
    user_id: user.id,
    category_id: transactionData.category_id || null,
    amount: transactionData.amount,
    type: transactionData.type,
    description: transactionData.description,
    date: transactionData.date || new Date().toISOString(),
    is_recurring: transactionData.is_recurring || false,
    recurrence_pattern: transactionData.recurrence_pattern,
    notes: transactionData.notes
  }

  if (transactionData.savings_goal_id) {
    payload.savings_goal_id = transactionData.savings_goal_id
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([payload])
    .select()

  if (error) throw error

  // Si lié à un objectif d'épargne, mettre à jour current_amount
  // Règle métier: ajouter de l'argent à l'objectif = DÉPENSE sur le compte
  // Donc expense => +amount dans l'objectif, income => -amount (retrait)
  if (transactionData.savings_goal_id) {
    await updateSavingsGoalAmount(
      transactionData.savings_goal_id,
      transactionData.type === 'expense' ? transactionData.amount : -transactionData.amount
    )
  }

  return data[0]
}

// Incrémenter / décrémenter le montant d'un objectif d'épargne
async function updateSavingsGoalAmount(goalId, delta) {
  const { data: goal } = await supabase
    .from('savings_goals')
    .select('current_amount')
    .eq('id', goalId)
    .single()

  if (goal) {
    const newAmount = Math.max(0, (goal.current_amount || 0) + delta)
    await supabase
      .from('savings_goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId)
  }
}

export async function updateTransaction(transactionId, updates) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteTransaction(transactionId) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)

  if (error) throw error
}

export async function validateTransaction(transactionId) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('transactions')
    .update({
      is_validated: true,
      validated_at: new Date().toISOString(),
      validated_by: user.id
    })
    .eq('id', transactionId)
    .select()

  if (error) throw error
  return data[0]
}

export async function unvalidateTransaction(transactionId) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      is_validated: false,
      validated_at: null,
      validated_by: null
    })
    .eq('id', transactionId)
    .select()

  if (error) throw error
  return data[0]
}

// ============ TRANSACTION OCCURRENCES ============
export async function getTransactionOccurrences(transactionId, startDate, endDate) {
  const { data, error } = await supabase
    .from('transaction_occurrences')
    .select('*')
    .eq('transaction_id', transactionId)
    .gte('occurrence_date', startDate)
    .lte('occurrence_date', endDate)
    .order('occurrence_date')

  if (error) throw error
  return data || []
}

export async function modifyOccurrence(transactionId, occurrenceDate, updates) {
  const { data, error } = await supabase
    .from('transaction_occurrences')
    .upsert({
      transaction_id: transactionId,
      occurrence_date: occurrenceDate,
      is_modified: true,
      modified_amount: updates.amount,
      notes: updates.notes || '',
      amount: updates.originalAmount || updates.amount
    })
    .select()

  if (error) throw error
  return data[0]
}

export async function skipOccurrence(transactionId, occurrenceDate) {
  const { data, error } = await supabase
    .from('transaction_occurrences')
    .upsert({
      transaction_id: transactionId,
      occurrence_date: occurrenceDate,
      is_skipped: true,
      amount: 0
    })
    .select()

  if (error) throw error
  return data[0]
}

export async function unskipOccurrence(transactionId, occurrenceDate) {
  const { error } = await supabase
    .from('transaction_occurrences')
    .delete()
    .eq('transaction_id', transactionId)
    .eq('occurrence_date', occurrenceDate)

  if (error) throw error
}

export async function validateOccurrence(transactionId, occurrenceDate) {
  const { data, error } = await supabase
    .from('transaction_occurrences')
    .upsert({
      transaction_id: transactionId,
      occurrence_date: occurrenceDate,
      is_validated: true,
      amount: 0
    }, {
      onConflict: 'transaction_id,occurrence_date'
    })
    .select()

  if (error) throw error
  return data[0]
}

// Générer les occurrences d'une transaction récurrente pour une période
export function generateRecurringOccurrences(transaction, startDate, endDate) {
  if (!transaction.is_recurring) return []

  const occurrences = []
  let currentDate = new Date(transaction.date)
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Avancer jusqu'au début de la période
  while (currentDate < start) {
    currentDate = getNextRecurrenceDate(currentDate, transaction.recurrence_pattern)
  }

  // Générer les occurrences dans la période
  while (currentDate <= end) {
    occurrences.push({
      transaction_id: transaction.id,
      occurrence_date: currentDate.toISOString().split('T')[0],
      amount: transaction.amount,
      is_skipped: false,
      is_modified: false
    })
    currentDate = getNextRecurrenceDate(currentDate, transaction.recurrence_pattern)
  }

  return occurrences
}

function getNextRecurrenceDate(date, pattern) {
  const nextDate = new Date(date)
  
  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1)
      break
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'bi-weekly':
      nextDate.setDate(nextDate.getDate() + 14)
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3)
      break
    case 'semi-annually':
      nextDate.setMonth(nextDate.getMonth() + 6)
      break
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
    default:
      nextDate.setMonth(nextDate.getMonth() + 1)
  }
  
  return nextDate
}

// Obtenir toutes les transactions avec leurs occurrences pour une période
export async function getTransactionsWithOccurrences(accountId, month, year) {
  const transactions = await getTransactions(accountId)
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  
  const result = []
  
  for (const transaction of transactions) {
    if (transaction.is_recurring) {
      // Générer les occurrences théoriques
      const theoreticalOccurrences = generateRecurringOccurrences(
        transaction,
        startDate,
        endDate
      )
      
      // Récupérer les modifications/sauts
      const modifications = await getTransactionOccurrences(
        transaction.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      
      // Fusionner les données
      for (const occ of theoreticalOccurrences) {
        const mod = modifications.find(m => m.occurrence_date === occ.occurrence_date)
        
        if (mod?.is_skipped) continue // Ne pas afficher si sauté
        
        result.push({
          ...transaction,
          date: occ.occurrence_date,
          amount: mod?.modified_amount || occ.amount,
          is_occurrence: true,
          occurrence_id: mod?.id,
          occurrence_date: occ.occurrence_date,
          is_modified: mod?.is_modified || false,
          is_validated: mod?.is_validated || false,
          occurrence_notes: mod?.notes
        })
      }
    } else {
      // Transaction ponctuelle
      const transDate = new Date(transaction.date)
      if (transDate >= startDate && transDate <= endDate) {
        result.push({
          ...transaction,
          is_occurrence: false
        })
      }
    }
  }
  
  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
}

// ============ CATEGORIES ============
export async function getCategories() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('transaction_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) throw error
  return data || []
}

// Récupérer les catégories avec leur hiérarchie parent/enfant
export async function getCategoriesWithHierarchy() {
  const categories = await getCategories()

  // Séparer parents et enfants
  const parents = categories.filter(c => !c.parent_id)
  const children = categories.filter(c => c.parent_id)

  // Attacher les enfants à leurs parents
  return parents.map(parent => ({
    ...parent,
    subcategories: children.filter(c => c.parent_id === parent.id)
  }))
}

// Récupérer tous les IDs d'une catégorie et ses sous-catégories
export function getDescendantCategoryIds(categoryId, allCategories) {
  const directChildren = allCategories.filter(c => c.parent_id === categoryId)
  const childIds = directChildren.map(c => c.id)
  const grandChildIds = directChildren.flatMap(c => getDescendantCategoryIds(c.id, allCategories))
  return [categoryId, ...childIds, ...grandChildIds]
}

export async function createCategory(categoryData) {
  const { data: { user } } = await supabase.auth.getUser()

  const payload = {
    user_id: user.id,
    name: categoryData.name,
    color: categoryData.color || '#808080',
    icon: categoryData.icon,
    type: categoryData.type || 'expense'
  }

  // parent_id optionnel — n'insérer que si la colonne existe dans le schéma
  if (categoryData.parent_id) {
    payload.parent_id = categoryData.parent_id
  }

  const { data, error } = await supabase
    .from('transaction_categories')
    .insert([payload])
    .select()

  // Si la colonne parent_id n'existe pas encore, réessayer sans
  if (error && error.code === 'PGRST204' && payload.parent_id) {
    delete payload.parent_id
    const { data: data2, error: error2 } = await supabase
      .from('transaction_categories')
      .insert([payload])
      .select()
    if (error2) throw error2
    return data2[0]
  }

  if (error) throw error
  return data[0]
}

export async function deleteCategory(categoryId) {
  const { error } = await supabase
    .from('transaction_categories')
    .delete()
    .eq('id', categoryId)

  if (error) throw error
}

// ============ BUDGETS ============
// Convention sans colonne supplémentaire:
// limit_amount < 0  → pourcentage des revenus (abs value = %)
// limit_amount >= 0 → montant fixe en €
function encodeBudgetLimit(limit_amount, limit_type) {
  const val = Math.abs(parseFloat(limit_amount) || 0)
  return limit_type === 'percentage' ? -val : val
}

export function parseBudget(raw) {
  if (!raw) return raw
  const isPercentage = (raw.limit_amount || 0) < 0
  return {
    ...raw,
    limit_type: isPercentage ? 'percentage' : 'amount',
    limit_amount: Math.abs(raw.limit_amount || 0)
  }
}

export async function getBudgets(accountId) {
  if (!accountId) return []

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at')

  if (error) throw error
  return (data || []).map(parseBudget)
}

export async function createBudget(budgetData) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('budgets')
    .insert([
      {
        account_id: budgetData.account_id,
        user_id: user.id,
        category_id: budgetData.category_id,
        name: budgetData.name,
        limit_amount: encodeBudgetLimit(budgetData.limit_amount, budgetData.limit_type),
        period: budgetData.period || 'monthly',
        start_date: budgetData.start_date || new Date().toISOString(),
        end_date: budgetData.end_date,
        alert_threshold: budgetData.alert_threshold || 80,
        is_active: true
      }
    ])
    .select()

  if (error) throw error
  return parseBudget(data[0])
}

export async function updateBudget(budgetId, updates) {
  const toStore = {
    ...updates,
    limit_amount: encodeBudgetLimit(updates.limit_amount, updates.limit_type)
  }
  delete toStore.limit_type

  const { data, error } = await supabase
    .from('budgets')
    .update(toStore)
    .eq('id', budgetId)
    .select()

  if (error) throw error
  return parseBudget(data[0])
}

export async function deleteBudget(budgetId) {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId)

  if (error) throw error
}

// ============ USER PREFERENCES ============
export async function getUserPreferences() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUserPreferences(prefs) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert([
      {
        user_id: user.id,
        theme: prefs.theme,
        language: prefs.language,
        notifications_enabled: prefs.notifications_enabled,
        currency_preferred: prefs.currency_preferred
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

// ============ PROFILES ============
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createProfile(profileData) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: user.email,
        username: profileData.username,
        avatar_url: profileData.avatar_url
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

export async function updateProfile(profileData) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()

  if (error) throw error
  return data[0]
}

// ============ SAVINGS GOALS ============
export async function getSavingsGoals(accountId) {
  if (!accountId) {
    return []
  }

  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createSavingsGoal(goalData) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('savings_goals')
    .insert([
      {
        account_id: goalData.account_id,
        user_id: user.id,
        name: goalData.name,
        target_amount: goalData.target_amount,
        current_amount: goalData.current_amount || 0,
        target_date: goalData.target_date,
        color: goalData.color || '#4CAF50',
        icon: goalData.icon,
        description: goalData.description,
        is_physical: goalData.is_physical || false,
        is_active: true
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

export async function updateSavingsGoal(goalId, updates) {
  const { data, error } = await supabase
    .from('savings_goals')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteSavingsGoal(goalId) {
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', goalId)

  if (error) throw error
}

// ============ CALCUL DES SOLDES ============
// Solde réel    = account.current_balance (tel que vu sur l'appli bancaire)
// Solde prévu   = solde réel + revenus récurrents futurs - dépenses récurrentes futures (fin de mois)
// Solde disponible = solde prévu - épargne virtuelle non physique (argent "réservé" sur le compte)

export function calculateBalances(account, allTransactions, savingsGoals, referenceDate = new Date()) {
  const realBalance = account?.current_balance || 0

  // Aujourd'hui réel (pas le mois sélectionné)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Fin du mois SÉLECTIONNÉ — projection cumulative de aujourd'hui jusqu'à cette date
  // Si mois sélectionné = juin et on est en mars → on projette avril+mai+juin
  const endOfSelectedMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0)
  endOfSelectedMonth.setHours(23, 59, 59, 999)

  // Projection uniquement dans le futur (si mois passé, projectedBalance ≈ realBalance)
  const projectionStart = today
  const projectionEnd = endOfSelectedMonth > today ? endOfSelectedMonth : today

  let projectedDelta = 0
  for (const t of allTransactions) {
    if (!t.is_recurring) continue
    // Toutes les occurrences de AUJOURD'HUI jusqu'à fin du mois sélectionné
    const futureOccs = generateRecurringOccurrences(t, projectionStart, projectionEnd)
    for (const occ of futureOccs) {
      const occDate = new Date(occ.occurrence_date)
      if (occDate > today) {
        projectedDelta += t.type === 'income' ? t.amount : -t.amount
      }
    }
  }

  const projectedBalance = realBalance + projectedDelta

  // Épargne virtuelle = somme des objectifs is_physical=false (argent encore sur le compte mais réservé)
  const virtualSavings = (savingsGoals || [])
    .filter(g => !g.is_physical && g.is_active)
    .reduce((sum, g) => sum + (g.current_amount || 0), 0)

  const availableBalance = projectedBalance - virtualSavings

  return { realBalance, projectedBalance, availableBalance, virtualSavings }
}

// ============ DASHBOARD ============
export async function getDashboardData(accountId) {
  try {
    const [accounts, transactions, budgets, savingsGoals] = await Promise.all([
      getAccounts(),
      getTransactions(accountId),
      getBudgets(accountId),
      getSavingsGoals(accountId)
    ])

    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0)

    return {
      accounts,
      transactions,
      budgets,
      savingsGoals,
      totalBalance
    }
  } catch (error) {
    console.error('Erreur dashboard:', error)
    throw error
  }
}

// ============ REAL-TIME SUBSCRIPTIONS ============
export function subscribeToTransactions(accountId, onNewTransaction) {
  return supabase
    .channel(`transactions-${accountId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'transactions',
      filter: `account_id=eq.${accountId}`
    }, (payload) => {
      onNewTransaction(payload.new)
    })
    .subscribe()
}

export function subscribeToAccounts(onUpdate) {
  return supabase
    .channel('accounts-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'accounts'
    }, (payload) => {
      onUpdate(payload)
    })
    .subscribe()
}
