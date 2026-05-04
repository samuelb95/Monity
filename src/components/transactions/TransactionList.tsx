import type { Account, Category, Group, Transaction } from '../../types/finance'
import { EmptyState } from '../ui/EmptyState'
import { TransactionItem } from './TransactionItem'

type TransactionListProps = {
  accounts: Account[]
  categories: Category[]
  groups: Group[]
  onDeleteTransaction: (transactionId: string) => void
  onEditTransaction: (transaction: Transaction) => void
  transactions: Transaction[]
}

export function TransactionList({
  accounts,
  categories,
  groups,
  onDeleteTransaction,
  onEditTransaction,
  transactions,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Aucune transaction"
        description="Ajoutez une première dépense, un revenu ou un transfert confirmé."
      />
    )
  }

  return (
    <ul className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionItem
          accounts={accounts}
          categories={categories}
          groups={groups}
          key={transaction.id}
          onDelete={onDeleteTransaction}
          onEdit={onEditTransaction}
          transaction={transaction}
        />
      ))}
    </ul>
  )
}
