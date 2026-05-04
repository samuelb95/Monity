import type { Account, Category } from '../../types/finance'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { periodOptions, typeOptions } from './transactionFilterOptions'
import type {
  TransactionFiltersValue,
  TransactionPeriodFilter,
} from './transactionFilterUtils'

type TransactionFilterBarProps = {
  accounts: Account[]
  categories: Category[]
  value: TransactionFiltersValue
  onChange: (value: TransactionFiltersValue) => void
  onReset: () => void
}

export function TransactionFilterBar({
  accounts,
  categories,
  onChange,
  onReset,
  value,
}: TransactionFilterBarProps) {
  const filteredCategories = categories.filter(
    (category) => value.type === 'all' || category.type === value.type,
  )

  return (
    <Card className="hidden items-end gap-3 p-3 lg:flex">
      <CompactSelect
        label="Type"
        onChange={(nextValue) =>
          onChange({
            ...value,
            categoryId: '',
            type: nextValue as TransactionFiltersValue['type'],
          })
        }
        options={typeOptions}
        value={value.type}
      />
      <CompactSelect
        label="Période"
        onChange={(nextValue) =>
          onChange({ ...value, period: nextValue as TransactionPeriodFilter })
        }
        options={periodOptions}
        value={value.period}
      />
      <CompactSelect
        label="Catégorie"
        onChange={(nextValue) => onChange({ ...value, categoryId: nextValue })}
        options={[
          { label: 'Toutes', value: '' },
          ...filteredCategories.map((category) => ({
            label: category.name,
            value: category.id,
          })),
        ]}
        value={value.categoryId}
      />
      <CompactSelect
        label="Compte"
        onChange={(nextValue) => onChange({ ...value, accountId: nextValue })}
        options={[
          { label: 'Tous', value: '' },
          ...accounts.map((account) => ({ label: account.name, value: account.id })),
        ]}
        value={value.accountId}
      />
      <Button className="shrink-0" onClick={onReset} variant="ghost">
        Réinitialiser
      </Button>
    </Card>
  )
}

type FilterOption = {
  label: string
  value: string
}

type CompactSelectProps = {
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

function CompactSelect({ label, onChange, options, value }: CompactSelectProps) {
  return (
    <label className="min-w-0 flex-1 text-xs font-medium text-text-secondary">
      <span className="mb-1 block">{label}</span>
      <select
        className="h-10 w-full rounded-button border border-border bg-background px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
