import type { Account, Category, Group } from '../../types/finance'
import { Select } from '../ui/Select'
import {
  familyOptions,
  periodOptions,
  typeOptions,
} from './transactionFilterOptions'
import type {
  TransactionFiltersValue,
  TransactionPeriodFilter,
} from './transactionFilterUtils'
import { TransactionMultiSelectField } from './TransactionMultiSelectField'

type TransactionFilterControlsProps = {
  accounts: Account[]
  categories: Category[]
  groups: Group[]
  value: TransactionFiltersValue
  onChange: (value: TransactionFiltersValue) => void
}

export function TransactionFilterControls({
  accounts,
  categories,
  groups,
  onChange,
  value,
}: TransactionFilterControlsProps) {
  const filteredCategories = categories.filter(
    (category) =>
      (value.type === 'all' || category.type === value.type) &&
      (value.families.length === 0 || value.families.includes(category.family)),
  )

  return (
    <>
      <Select
        label="Type"
        onChange={(event) =>
          onChange({
            ...value,
            categoryIds: [],
            type: event.target.value as TransactionFiltersValue['type'],
          })
        }
        options={typeOptions}
        value={value.type}
      />
      <TransactionMultiSelectField
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
        label="Catégorie"
        onChange={(categoryIds) => onChange({ ...value, categoryIds })}
        options={filteredCategories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        values={value.categoryIds}
      />
      <TransactionMultiSelectField
        label="Compte"
        onChange={(accountIds) => onChange({ ...value, accountIds })}
        options={accounts.map((account) => ({
          label: account.name,
          value: account.id,
        }))}
        values={value.accountIds}
      />
      <TransactionMultiSelectField
        label="Groupe"
        onChange={(groupIds) => onChange({ ...value, groupIds })}
        options={groups.map((group) => ({
          label: group.name,
          value: group.id,
        }))}
        values={value.groupIds}
      />
      <Select
        label="Période"
        onChange={(event) =>
          onChange({
            ...value,
            period: event.target.value as TransactionPeriodFilter,
          })
        }
        options={periodOptions}
        value={value.period}
      />
    </>
  )
}
