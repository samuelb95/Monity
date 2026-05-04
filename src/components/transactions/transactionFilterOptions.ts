import type { CategoryFamily } from '../../types/finance'
import type { TransactionFiltersValue } from './transactionFilterUtils'

export const familyOptions: Array<{ label: string; value: '' | CategoryFamily }> = [
  { label: 'Toutes', value: '' },
  { label: 'Essentiel', value: 'essential' },
  { label: 'Loisir', value: 'lifestyle' },
  { label: 'Épargne', value: 'savings' },
  { label: 'Investissement', value: 'investment' },
  { label: 'Revenus', value: 'income' },
]

export const typeOptions = [
  { label: 'Toutes', value: 'all' },
  { label: 'Dépenses', value: 'expense' },
  { label: 'Revenus', value: 'income' },
  { label: 'Transferts', value: 'transfer' },
]

export const periodOptions = [
  { label: 'Toutes', value: 'all' },
  { label: 'Ce mois', value: 'current_month' },
  { label: 'Mois dernier', value: 'last_month' },
]

export function countActiveFilters(value: TransactionFiltersValue) {
  return [
    value.type !== 'all',
    value.period !== 'all',
    value.categoryIds.length > 0,
    value.accountIds.length > 0,
    value.groupIds.length > 0,
    value.families.length > 0,
  ].filter(Boolean).length
}
