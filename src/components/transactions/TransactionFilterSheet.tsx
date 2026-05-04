import type { Account, Category, Group } from '../../types/finance'
import { Button } from '../ui/Button'
import { countActiveFilters } from './transactionFilterOptions'
import type { TransactionFiltersValue } from './transactionFilterUtils'
import { TransactionFilterControls } from './TransactionFilterControls'

type TransactionFilterSheetProps = {
  accounts: Account[]
  categories: Category[]
  groups: Group[]
  isOpen: boolean
  value: TransactionFiltersValue
  onApply: () => void
  onChange: (value: TransactionFiltersValue) => void
  onClose: () => void
  onOpen: () => void
  onReset: () => void
}

export function TransactionFilterSheet({
  accounts,
  categories,
  groups,
  isOpen,
  onApply,
  onChange,
  onClose,
  onOpen,
  onReset,
  value,
}: TransactionFilterSheetProps) {
  const activeCount = countActiveFilters(value)

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">Transactions</p>
          <p className="text-xs text-text-secondary">
            {activeCount > 0 ? `${activeCount} filtre(s) actif(s)` : 'Aucun filtre actif'}
          </p>
        </div>
        <Button onClick={onOpen} variant="secondary">
          Filtres
        </Button>
      </div>

      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-30 flex items-end bg-black/70 backdrop-blur-sm"
          role="dialog"
        >
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-card border border-border bg-surface p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-text-primary">Filtres</h2>
              <Button onClick={onClose} variant="ghost">
                Fermer
              </Button>
            </div>
            <div className="space-y-3">
              <TransactionFilterControls
                accounts={accounts}
                categories={categories}
                groups={groups}
                onChange={onChange}
                value={value}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button onClick={onReset} variant="secondary">
                Réinitialiser
              </Button>
              <Button onClick={onApply}>Appliquer</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
