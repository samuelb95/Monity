import type { Account, Group, Transaction } from '../../types/finance'
import { EmptyState } from '../ui/EmptyState'
import { TransactionItem } from './TransactionItem'

type TransactionListProps = {
  accounts: Account[]
  groups: Group[]
  transactions: Transaction[]
}

export function TransactionList({
  accounts,
  groups,
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
          groups={groups}
          key={transaction.id}
          transaction={transaction}
        />
      ))}
    </ul>
  )
}
