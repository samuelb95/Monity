import type { TransactionType } from '../../types/finance'

type TransactionTypeSelectorProps = {
  value: TransactionType
  onChange: (type: TransactionType) => void
}

const options: Array<{ label: string; value: TransactionType }> = [
  { label: 'Dépense', value: 'expense' },
  { label: 'Revenu', value: 'income' },
  { label: 'Transfert', value: 'transfer' },
]

export function TransactionTypeSelector({
  onChange,
  value,
}: TransactionTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-card border border-border bg-background p-1">
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            aria-pressed={isActive}
            className={[
              'rounded-button px-3 py-2 text-sm font-semibold transition',
              isActive
                ? 'bg-primary text-background shadow-glow'
                : 'text-text-secondary hover:bg-surface hover:text-text-primary',
            ].join(' ')}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
