import { createContext } from 'react'
import type {
  Account,
  Budget,
  Category,
  ForecastItem,
  Group,
  GroupAccount,
  GroupMember,
  Investment,
  RecurringOccurrence,
  RecurringTransaction,
  SavingsGoal,
  Transaction,
  User,
} from '../types/finance'
import { mockFinanceData } from './mockFinanceData'

export type FinanceDataState = {
  accounts: Account[]
  budgets: Budget[]
  categories: Category[]
  forecastItems: ForecastItem[]
  groupAccounts: GroupAccount[]
  groupMembers: GroupMember[]
  groups: Group[]
  investments: Investment[]
  recurringOccurrences: RecurringOccurrence[]
  recurringTransactions: RecurringTransaction[]
  savingsGoals: SavingsGoal[]
  transactions: Transaction[]
  user: User
}

export type FinanceDataActions = {
  addAccount: (account: Account) => void
  updateAccountBalance: (accountId: string, balance: number) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (transaction: Transaction) => void
  deleteTransaction: (transactionId: string) => void
  addRecurringTransaction: (transaction: RecurringTransaction) => void
  confirmRecurringOccurrence: (occurrenceId: string) => void
  skipRecurringOccurrence: (occurrenceId: string) => void
  addGroup: (group: Group) => void
  addGroupMember: (member: GroupMember) => void
  addGroupAccount: (groupAccount: GroupAccount) => void
  addSavingsGoal: (goal: SavingsGoal) => void
  updateSavingsGoal: (goal: SavingsGoal) => void
  deleteSavingsGoal: (goalId: string) => void
  addInvestment: (investment: Investment) => void
  updateInvestment: (investment: Investment) => void
}

export type FinanceDataContextValue = FinanceDataState & FinanceDataActions

export const initialFinanceData: FinanceDataState = mockFinanceData

export const FinanceDataContext = createContext<
  FinanceDataContextValue | undefined
>(undefined)
