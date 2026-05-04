import type { CurrencyCode } from '../types/finance'

export function formatCurrency(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat('fr-FR', {
    currency,
    style: 'currency',
  }).format(amount)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value / 100)
}
