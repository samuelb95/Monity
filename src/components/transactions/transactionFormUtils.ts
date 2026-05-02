import type { Transaction, TransactionType, User } from '../../types/finance'

export type FormErrors = Partial<
  Record<'amount' | 'date' | 'category' | 'account' | 'target', string>
>

export type TransactionFormValues = {
  accountId: string
  amount: number
  category: string
  date: string
  description: string
  groupId: string
  targetAccountId: string
  type: TransactionType
}

export const today = new Date().toISOString().slice(0, 10)

export function createConfirmedTransaction(
  values: TransactionFormValues,
  user: User,
): Transaction {
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    userId: user.id,
    type: values.type,
    amount: values.amount,
    date: values.date,
    category: values.type === 'transfer' ? 'Transfert' : values.category.trim(),
    accountId: values.accountId,
    transferTargetAccountId:
      values.type === 'transfer' ? values.targetAccountId : undefined,
    description: values.description.trim() || undefined,
    groupId: values.groupId || undefined,
    status: 'confirmed',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function validateTransactionForm(values: TransactionFormValues) {
  const errors: FormErrors = {}

  if (!values.date) {
    errors.date = 'La date est obligatoire.'
  }

  if (!Number.isFinite(values.amount) || values.amount <= 0) {
    errors.amount = 'Le montant doit être positif.'
  }

  if (!values.accountId) {
    errors.account = 'Le compte est obligatoire.'
  }

  if (values.type !== 'transfer' && !values.category.trim()) {
    errors.category = 'La catégorie est obligatoire.'
  }

  if (values.type === 'transfer') {
    if (!values.targetAccountId) {
      errors.target = 'Le compte destination est obligatoire.'
    } else if (values.accountId === values.targetAccountId) {
      errors.target = 'Les deux comptes doivent être différents.'
    }
  }

  return errors
}

export function toOptions(items: Array<{ id: string; name?: string; displayName?: string }>) {
  return items.map((item) => ({
    label: item.name ?? item.displayName ?? item.id,
    value: item.id,
  }))
}
