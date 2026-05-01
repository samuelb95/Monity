export type CurrencyCode = 'EUR' | 'USD'

export type EntityId = string
export type ISODateString = string

export type User = {
  id: EntityId
  name: string
  email: string
  defaultCurrency: CurrencyCode
  createdAt: ISODateString
}

export type AccountType =
  | 'checking'
  | 'savings'
  | 'cash'
  | 'credit_card'
  | 'investment'
  | 'group'

export type AccountOwnerType = 'user' | 'group'

export type Account = {
  id: EntityId
  userId: EntityId
  name: string
  type: AccountType
  balance: number
  currency: CurrencyCode
  ownerType: AccountOwnerType
  groupId?: EntityId
  createdAt: ISODateString
  updatedAt: ISODateString
}

export type TransactionType = 'expense' | 'income' | 'transfer'
export type TransactionStatus = 'confirmed'

export type Transaction = {
  id: EntityId
  userId: EntityId
  type: TransactionType
  amount: number
  date: ISODateString
  category: string
  accountId: EntityId
  transferTargetAccountId?: EntityId
  description?: string
  groupId?: EntityId
  paidByMemberId?: EntityId
  recurringOccurrenceId?: EntityId
  status: TransactionStatus
  createdAt: ISODateString
  updatedAt: ISODateString
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type RecurringTransactionStatus = 'active' | 'paused' | 'ended'

export type RecurringTransaction = {
  id: EntityId
  userId: EntityId
  name: string
  type: Exclude<TransactionType, 'transfer'>
  amount: number
  category: string
  accountId: EntityId
  frequency: RecurringFrequency
  dayOfMonth?: number
  nextDueDate: ISODateString
  startDate: ISODateString
  endDate?: ISODateString
  status: RecurringTransactionStatus
  groupId?: EntityId
  paidByMemberId?: EntityId
  createdAt: ISODateString
  updatedAt: ISODateString
}

export type RecurringOccurrenceStatus = 'pending' | 'confirmed' | 'skipped'
export type RecurringOverrideType = 'none' | 'single' | 'future'

export type RecurringOccurrence = {
  id: EntityId
  recurringTransactionId: EntityId
  dueDate: ISODateString
  amount: number
  category: string
  accountId: EntityId
  status: RecurringOccurrenceStatus
  overrideType: RecurringOverrideType
  transactionId?: EntityId
  createdAt: ISODateString
  updatedAt: ISODateString
}

export type GroupType = 'household' | 'couple' | 'roommates' | 'project'
export type GroupMemberRole = 'owner' | 'admin' | 'member'

export type Group = {
  id: EntityId
  name: string
  type: GroupType
  currency: CurrencyCode
  createdAt: ISODateString
  updatedAt: ISODateString
}

export type GroupMember = {
  id: EntityId
  groupId: EntityId
  displayName: string
  email?: string
  role: GroupMemberRole
  createdAt: ISODateString
}

export type GroupAccount = {
  id: EntityId
  groupId: EntityId
  accountId: EntityId
  targetBalance?: number
  monthlyContributionAmount?: number
  contributionDueDay?: number
}

export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly'

export type Budget = {
  id: EntityId
  userId: EntityId
  name: string
  category: string
  limit: number
  period: BudgetPeriod
  groupId?: EntityId
  createdAt: ISODateString
  updatedAt: ISODateString
}

export type SavingsGoal = {
  id: EntityId
  userId: EntityId
  accountId: EntityId
  name: string
  targetAmount?: number
  currentAmount: number
  targetDate?: ISODateString
  color?: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export type InvestmentType = 'stock' | 'etf' | 'crypto' | 'fund' | 'other'

export type Investment = {
  id: EntityId
  userId: EntityId
  name: string
  type: InvestmentType
  value: number
  createdAt: ISODateString
}

export type ForecastItemType =
  | 'recurring_income'
  | 'recurring_expense'
  | 'group_contribution'

export type ForecastItem = {
  id: EntityId
  type: ForecastItemType
  label: string
  amount: number
  date: ISODateString
  accountId?: EntityId
  groupId?: EntityId
}

export type ForecastSummary = {
  periodStart: ISODateString
  periodEnd: ISODateString
  expectedIncome: number
  expectedExpenses: number
  estimatedBalance: number
  items: ForecastItem[]
}
