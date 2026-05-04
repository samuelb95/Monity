import type { Category, Transaction, TransactionType, User } from '../../types/finance'

export type FormErrors = Partial<
  Record<'amount' | 'date' | 'categoryId' | 'account' | 'target', string>
>

export type TransactionFormValues = {
  accountId: string
  amount: number
  categoryId: string
  date: string
  description: string
  groupId: string
  targetAccountId: string
  type: TransactionType
}

export type FormOption = {
  label: string
  value: string
}

export const today = new Date().toISOString().slice(0, 10)

export function getDefaultCategoryId(
  categories: Category[],
  type: TransactionType,
) {
  if (type !== 'transfer') {
    return ''
  }

  return (
    categories.find(
      (category) => category.type === 'transfer' && category.family === 'savings',
    )?.id ?? ''
  )
}

export function createConfirmedTransaction(
  values: TransactionFormValues,
  user: User,
  existingTransaction?: Transaction,
): Transaction {
  const timestamp = new Date().toISOString()

  return {
    id: existingTransaction?.id ?? crypto.randomUUID(),
    userId: user.id,
    type: values.type,
    amount: values.amount,
    date: values.date,
    categoryId: values.categoryId,
    accountId: values.accountId,
    transferTargetAccountId:
      values.type === 'transfer' ? values.targetAccountId : undefined,
    description: values.description.trim() || undefined,
    groupId: values.groupId || undefined,
    status: 'confirmed',
    createdAt: existingTransaction?.createdAt ?? timestamp,
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

  if (!values.categoryId) {
    errors.categoryId = 'La catégorie est obligatoire.'
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

export function toOptions(
  items: Array<{ id: string; name?: string; displayName?: string }>,
): FormOption[] {
  return items.map((item) => ({
    label: item.name ?? item.displayName ?? item.id,
    value: item.id,
  }))
}
