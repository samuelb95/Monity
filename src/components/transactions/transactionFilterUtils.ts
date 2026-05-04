import type {
  Category,
  CategoryFamily,
  Transaction,
  TransactionType,
} from '../../types/finance'

export type TransactionPeriodFilter = 'all' | 'current_month' | 'last_month'

export type TransactionFiltersValue = {
  accountIds: string[]
  categoryIds: string[]
  families: CategoryFamily[]
  groupIds: string[]
  period: TransactionPeriodFilter
  type: 'all' | TransactionType
}

export const defaultTransactionFilters: TransactionFiltersValue = {
  accountIds: [],
  categoryIds: [],
  families: [],
  groupIds: [],
  period: 'all',
  type: 'all',
}

export function filterTransactions({
  categories,
  filters,
  transactions,
}: {
  categories: Category[]
  filters: TransactionFiltersValue
  transactions: Transaction[]
}) {
  return transactions.filter((transaction) => {
    const category = categories.find((item) => item.id === transaction.categoryId)

    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false
    }

    if (
      filters.families.length > 0 &&
      (!category || !filters.families.includes(category.family))
    ) {
      return false
    }

    if (
      filters.categoryIds.length > 0 &&
      !filters.categoryIds.includes(transaction.categoryId)
    ) {
      return false
    }

    if (
      filters.accountIds.length > 0 &&
      !filters.accountIds.includes(transaction.accountId)
    ) {
      return false
    }

    if (
      filters.groupIds.length > 0 &&
      (!transaction.groupId || !filters.groupIds.includes(transaction.groupId))
    ) {
      return false
    }

    return isInSelectedPeriod(transaction.date, filters.period)
  })
}

function isInSelectedPeriod(date: string, period: TransactionPeriodFilter) {
  if (period === 'all') {
    return true
  }

  const todayDate = new Date()
  const transactionDate = new Date(date)
  const currentMonth = todayDate.getMonth()
  const currentYear = todayDate.getFullYear()

  if (period === 'current_month') {
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    )
  }

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
  return (
    transactionDate.getMonth() === lastMonthDate.getMonth() &&
    transactionDate.getFullYear() === lastMonthDate.getFullYear()
  )
}
