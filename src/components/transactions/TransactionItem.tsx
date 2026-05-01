import type { Account, Transaction } from '../../types/finance'
import { formatCurrency, formatDate } from '../../utils/formatters'

type TransactionItemProps = {
  accounts: Account[]
  transaction: Transaction
}

const typeLabels: Record<Transaction['type'], string> = {
  expense: 'Dépense',
  income: 'Revenu',
  transfer: 'Transfert',
}

export function TransactionItem({ accounts, transaction }: TransactionItemProps) {
  const account = accounts.find((item) => item.id === transaction.accountId)
  const targetAccount = accounts.find(
    (item) => item.id === transaction.transferTargetAccountId,
  )
  const amountPrefix = transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''
  const amountTone =
    transaction.type === 'income'
      ? 'text-success'
      : transaction.type === 'expense'
        ? 'text-danger'
        : 'text-primary'

  return (
    <li className="flex items-start justify-between gap-4 rounded-card border border-border bg-surface p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-text-primary">
            {transaction.description || transaction.category}
          </p>
          <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-text-secondary">
            {typeLabels[transaction.type]}
          </span>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          {formatDate(transaction.date)} · {account?.name ?? 'Compte inconnu'}
          {targetAccount ? ` vers ${targetAccount.name}` : ''}
        </p>
        {transaction.description ? (
          <p className="mt-1 text-sm text-text-secondary">{transaction.category}</p>
        ) : null}
      </div>
      <p className={`shrink-0 text-sm font-semibold ${amountTone}`}>
        {amountPrefix}
        {formatCurrency(transaction.amount, account?.currency ?? 'EUR')}
      </p>
    </li>
  )
}
