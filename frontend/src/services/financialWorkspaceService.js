import {
  calculateBalances,
  createAccount,
  getBudgets,
  getCategories,
  getDashboardData,
  getSavingsGoals,
  getTransactions,
  getTransactionsWithOccurrences,
} from './supabaseService';

export async function ensurePrimaryAccount() {
  const initialData = await getDashboardData(null);

  let primaryAccount = initialData.accounts?.[0];

  if (!primaryAccount) {
    try {
      primaryAccount = await createAccount({
        name: 'Mon compte principal',
        type: 'personal',
        current_balance: 0,
        currency: 'EUR',
      });
    } catch (error) {
      console.error('Erreur création compte par défaut:', error);
      primaryAccount = {
        id: null,
        name: 'Mon compte',
        current_balance: 0,
        type: 'personal',
        currency: 'EUR',
      };
    }
  }

  return primaryAccount;
}

export async function loadFinancialWorkspace(selectedDate = new Date()) {
  const primaryAccount = await ensurePrimaryAccount();

  const [allTransactions, monthTransactions, budgets, savingsGoals, categories] = await Promise.all([
    getTransactions(primaryAccount.id),
    getTransactionsWithOccurrences(
      primaryAccount.id,
      selectedDate.getMonth(),
      selectedDate.getFullYear()
    ),
    getBudgets(primaryAccount.id),
    getSavingsGoals(primaryAccount.id),
    getCategories(),
  ]);

  return {
    primaryAccount,
    allTransactions,
    monthTransactions,
    budgets,
    savingsGoals,
    categories,
    balances: calculateBalances(primaryAccount, allTransactions, savingsGoals, selectedDate),
  };
}
