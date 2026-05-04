import type {
  Budget,
  Category,
  ForecastItem,
  ForecastSummary,
  GroupMember,
  RecurringTransaction,
  Transaction,
} from '../types/finance'

export function getConfirmedTransactionsOnly(transactions: Transaction[]) {
  return transactions.filter((transaction) => transaction.status === 'confirmed')
}

export function totalIncome(transactions: Transaction[]) {
  return getConfirmedTransactionsOnly(transactions).reduce((total, transaction) => {
    if (transaction.type !== 'income') {
      return total
    }

    return total + transaction.amount
  }, 0)
}

export function totalExpenses(transactions: Transaction[]) {
  return getConfirmedTransactionsOnly(transactions).reduce((total, transaction) => {
    if (transaction.type !== 'expense') {
      return total
    }

    return total + transaction.amount
  }, 0)
}

export function availableBalance(transactions: Transaction[], openingBalance = 0) {
  return openingBalance + totalIncome(transactions) - totalExpenses(transactions)
}

export function expensesByCategory(transactions: Transaction[]) {
  return getConfirmedTransactionsOnly(transactions).reduce<Record<string, number>>(
    (categories, transaction) => {
      if (transaction.type !== 'expense') {
        return categories
      }

      return {
        ...categories,
        [transaction.categoryId]:
          (categories[transaction.categoryId] ?? 0) + transaction.amount,
      }
    },
    {},
  )
}

export function expensesByFamily(
  transactions: Transaction[],
  categories: Category[],
) {
  return getConfirmedTransactionsOnly(transactions).reduce<Record<string, number>>(
    (families, transaction) => {
      if (transaction.type !== 'expense') {
        return families
      }

      const category = categories.find((item) => item.id === transaction.categoryId)
      const family = category?.family ?? 'essential'

      return {
        ...families,
        [family]: (families[family] ?? 0) + transaction.amount,
      }
    },
    {},
  )
}

export function budgetUsage(budget: Budget, transactions: Transaction[]) {
  if (budget.limit <= 0) {
    return 0
  }

  const spent = getConfirmedTransactionsOnly(transactions)
    .filter(
      (transaction) =>
        transaction.categoryId === budget.category ||
        transaction.category === budget.category,
    )
    .reduce((total, transaction) => {
      if (transaction.type !== 'expense') {
        return total
      }

      return total + transaction.amount
    }, 0)

  return Math.min((spent / budget.limit) * 100, 100)
}

export function getGroupMembers(groupMembers: GroupMember[], groupId: string) {
  return groupMembers.filter((member) => member.groupId === groupId)
}

export function getGroupTransactions(transactions: Transaction[], groupId: string) {
  return getConfirmedTransactionsOnly(transactions).filter(
    (transaction) => transaction.groupId === groupId,
  )
}

export function getUpcomingRecurringTransactions(
  recurringTransactions: RecurringTransaction[],
  fromDate: string,
  toDate: string,
) {
  const start = new Date(fromDate).getTime()
  const end = new Date(toDate).getTime()

  return recurringTransactions.filter((transaction) => {
    if (transaction.status !== 'active') {
      return false
    }

    const nextDueDate = new Date(transaction.nextDueDate).getTime()
    return nextDueDate >= start && nextDueDate <= end
  })
}

export function calculateForecastSummary(
  items: ForecastItem[],
  periodStart: string,
  periodEnd: string,
  openingBalance = 0,
): ForecastSummary {
  const start = new Date(periodStart).getTime()
  const end = new Date(periodEnd).getTime()
  const periodItems = items.filter((item) => {
    const itemDate = new Date(item.date).getTime()
    return itemDate >= start && itemDate <= end
  })

  const expectedIncome = periodItems.reduce((total, item) => {
    if (item.type !== 'recurring_income' && item.type !== 'group_contribution') {
      return total
    }

    return total + item.amount
  }, 0)

  const expectedExpenses = periodItems.reduce((total, item) => {
    if (item.type !== 'recurring_expense') {
      return total
    }

    return total + item.amount
  }, 0)

  return {
    periodStart,
    periodEnd,
    expectedIncome,
    expectedExpenses,
    estimatedBalance: openingBalance + expectedIncome - expectedExpenses,
    items: periodItems,
  }
}

export function calculateBalance(transactions: Transaction[]) {
  return availableBalance(transactions)
}

export function calculateBudgetProgress(budget: Budget, transactions: Transaction[]) {
  return budgetUsage(budget, transactions)
}
