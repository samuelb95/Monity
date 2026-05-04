import type { Account, Category } from '../../types/finance'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import {
  familyOptions,
  periodOptions,
  typeOptions,
} from './transactionFilterOptions'
import type {
  TransactionFiltersValue,
  TransactionPeriodFilter,
} from './transactionFilterUtils'
import { closeTransactionFilterMenus } from './transactionMenuEvents'
import { TransactionMultiSelectField } from './TransactionMultiSelectField'

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
    (category) =>
      (value.type === 'all' || category.type === value.type) &&
      (value.families.length === 0 || value.families.includes(category.family)),
  )

  return (
    <Card className="hidden items-end gap-2 p-3 xl:flex">
      <CompactSelect
        label="Type"
        onChange={(nextValue) =>
          onChange({
            ...value,
            categoryIds: [],
            type: nextValue as TransactionFiltersValue['type'],
          })
        }
        options={typeOptions}
        value={value.type}
        widthClass="w-40"
      />
      <CompactSelect
        label="Période"
        onChange={(nextValue) =>
          onChange({ ...value, period: nextValue as TransactionPeriodFilter })
        }
        options={periodOptions}
        value={value.period}
        widthClass="w-40"
      />
      <TransactionMultiSelectField
        className="w-40"
        label="Famille"
        onChange={(families) =>
          onChange({
            ...value,
            categoryIds: [],
            families: families as TransactionFiltersValue['families'],
          })
        }
        options={familyOptions.filter((option) => option.value !== '')}
        values={value.families}
      />
      <TransactionMultiSelectField
        className="w-44"
        label="Catégorie"
        onChange={(categoryIds) => onChange({ ...value, categoryIds })}
        options={filteredCategories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        values={value.categoryIds}
      />
      <TransactionMultiSelectField
        className="w-44"
        label="Compte"
        onChange={(accountIds) => onChange({ ...value, accountIds })}
        options={accounts.map((account) => ({
          label: account.name,
          value: account.id,
        }))}
        values={value.accountIds}
      />
      <Button className="shrink-0 px-3 text-xs" onClick={onReset} variant="ghost">
        Reset
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
  widthClass?: string
  onChange: (value: string) => void
}

function CompactSelect({
  label,
  onChange,
  options,
  value,
  widthClass = 'min-w-0 flex-1',
}: CompactSelectProps) {
  return (
    <label className={`${widthClass} text-xs font-medium text-text-secondary`}>
      <span className="mb-1 block">{label}</span>
      <select
        className="h-10 w-full rounded-button border border-border bg-background px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        onFocus={closeTransactionFilterMenus}
        onMouseDown={closeTransactionFilterMenus}
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
