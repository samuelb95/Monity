import type { Account, Category, Group, Transaction } from '../../types/finance'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { TransactionActionMenu } from './TransactionActionMenu'

type TransactionItemProps = {
  accounts: Account[]
  categories: Category[]
  groups: Group[]
  onDelete: (transactionId: string) => void
  onEdit: (transaction: Transaction) => void
  transaction: Transaction
}

const typeLabels: Record<Transaction['type'], string> = {
  expense: 'Dépense',
  income: 'Revenu',
  transfer: 'Transfert',
}

const familyLabels: Record<Category['family'], string> = {
  essential: 'Essentiel',
  lifestyle: 'Loisir',
  savings: 'Épargne',
  investment: 'Investissement',
  income: 'Revenus',
}

export function TransactionItem({
  accounts,
  categories,
  groups,
  onDelete,
  onEdit,
  transaction,
}: TransactionItemProps) {
  const account = accounts.find((item) => item.id === transaction.accountId)
  const category = categories.find((item) => item.id === transaction.categoryId)
  const group = groups.find((item) => item.id === transaction.groupId)
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
    <li className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-3.5 sm:p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="mr-1 font-semibold leading-5 text-text-primary">
            {transaction.description || category?.name || transaction.category}
          </p>
          <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-text-secondary">
            {category?.name ?? typeLabels[transaction.type]}
          </span>
          {category ? (
            <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-text-secondary">
              {familyLabels[category.family]}
            </span>
          ) : null}
          {group ? (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {group.name}
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 text-sm leading-5 text-text-secondary">
          {formatDate(transaction.date)} · Payé avec {account?.name ?? 'Compte inconnu'}
          {targetAccount ? ` vers ${targetAccount.name}` : ''}
          {group ? ` · Groupe : ${group.name}` : ''}
        </p>
        {transaction.description ? (
          <p className="mt-1 text-xs text-text-secondary">
            Catégorie : {category?.name ?? transaction.category ?? 'Non classée'}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-start gap-2">
        <p className={`pt-2 text-sm font-semibold ${amountTone}`}>
          {amountPrefix}
          {formatCurrency(transaction.amount, account?.currency ?? 'EUR')}
        </p>
        <TransactionActionMenu
          onDelete={onDelete}
          onEdit={onEdit}
          transaction={transaction}
        />
      </div>
    </li>
  )
}
