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
  const { user } = await supabase.auth.getUser()

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
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories:category_id(*)
    `)
    .eq('account_id', accountId)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTransaction(transactionData) {
  const { user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        account_id: transactionData.account_id,
        user_id: user.id,
        category_id: transactionData.category_id,
        amount: transactionData.amount,
        type: transactionData.type,
        description: transactionData.description,
        date: transactionData.date || new Date().toISOString(),
        is_recurring: transactionData.is_recurring || false,
        recurrence_pattern: transactionData.recurrence_pattern,
        notes: transactionData.notes
      }
    ])
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

// ============ CATEGORIES ============
export async function getCategories() {
  const { user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('transaction_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) throw error
  return data || []
}

export async function createCategory(categoryData) {
  const { user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('transaction_categories')
    .insert([
      {
        user_id: user.id,
        name: categoryData.name,
        color: categoryData.color || '#808080',
        icon: categoryData.icon,
        type: categoryData.type || 'expense'
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

// ============ BUDGETS ============
export async function getBudgets(accountId) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at')

  if (error) throw error
  return data || []
}

export async function createBudget(budgetData) {
  const { user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('budgets')
    .insert([
      {
        account_id: budgetData.account_id,
        user_id: user.id,
        category_id: budgetData.category_id,
        name: budgetData.name,
        limit_amount: budgetData.limit_amount,
        period: budgetData.period || 'monthly',
        start_date: budgetData.start_date || new Date().toISOString(),
        end_date: budgetData.end_date,
        alert_threshold: budgetData.alert_threshold || 80,
        is_active: true
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

// ============ USER PREFERENCES ============
export async function getUserPreferences() {
  const { user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUserPreferences(prefs) {
  const { user } = await supabase.auth.getUser()

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
  const { user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createProfile(profileData) {
  const { user } = await supabase.auth.getUser()

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
  const { user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()

  if (error) throw error
  return data[0]
}

// ============ DASHBOARD ============
export async function getDashboardData(accountId) {
  try {
    const [accounts, transactions, budgets] = await Promise.all([
      getAccounts(),
      getTransactions(accountId),
      getBudgets(accountId)
    ])

    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0)

    return {
      accounts,
      transactions,
      budgets,
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
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'accounts'
    }, (payload) => {
      onUpdate(payload)
    })
    .subscribe()
}