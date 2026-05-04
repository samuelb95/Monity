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
      (!value.family || category.family === value.family),
  )

  return (
    <>
      <Select
        label="Type"
        onChange={(event) =>
          onChange({
            ...value,
            categoryId: '',
            type: event.target.value as TransactionFiltersValue['type'],
          })
        }
        options={typeOptions}
        value={value.type}
      />
      <Select
        label="Famille"
        onChange={(event) =>
          onChange({
            ...value,
            categoryId: '',
            family: event.target.value as TransactionFiltersValue['family'],
          })
        }
        options={familyOptions}
        value={value.family}
      />
      <Select
        label="Catégorie"
        onChange={(event) => onChange({ ...value, categoryId: event.target.value })}
        options={[
          { label: 'Toutes', value: '' },
          ...filteredCategories.map((category) => ({
            label: category.name,
            value: category.id,
          })),
        ]}
        value={value.categoryId}
      />
      <Select
        label="Compte"
        onChange={(event) => onChange({ ...value, accountId: event.target.value })}
        options={[
          { label: 'Tous', value: '' },
          ...accounts.map((account) => ({ label: account.name, value: account.id })),
        ]}
        value={value.accountId}
      />
      <Select
        label="Groupe"
        onChange={(event) => onChange({ ...value, groupId: event.target.value })}
        options={[
          { label: 'Tous', value: '' },
          ...groups.map((group) => ({ label: group.name, value: group.id })),
        ]}
        value={value.groupId}
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
