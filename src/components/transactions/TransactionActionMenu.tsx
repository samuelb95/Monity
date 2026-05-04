import { useRef } from 'react'
import type { Transaction } from '../../types/finance'

type TransactionActionMenuProps = {
  onDelete: (transactionId: string) => void
  onEdit: (transaction: Transaction) => void
  transaction: Transaction
}

export function TransactionActionMenu({
  onDelete,
  onEdit,
  transaction,
}: TransactionActionMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  function closeMenu() {
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  return (
    <details className="group relative shrink-0" ref={detailsRef}>
      <summary
        aria-label="Actions de transaction"
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-button border border-border bg-surface-elevated text-xl leading-none text-text-secondary transition hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-details-marker]:hidden"
      >
        ⋯
      </summary>
      <div className="absolute right-0 top-12 z-10 w-36 overflow-hidden rounded-card border border-border bg-surface-elevated shadow-card">
        <button
          className="block w-full px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-surface"
          onClick={() => {
            closeMenu()
            onEdit(transaction)
          }}
          type="button"
        >
          Modifier
        </button>
        <button
          className="block w-full px-4 py-3 text-left text-sm font-medium text-danger transition hover:bg-surface"
          onClick={() => {
            closeMenu()
            onDelete(transaction.id)
          }}
          type="button"
        >
          Supprimer
        </button>
      </div>
    </details>
  )
}
