import { useState } from 'react'
import type { Account, Category, Group } from '../../types/finance'
import { TransactionFilterBar } from './TransactionFilterBar'
import { TransactionFilterSheet } from './TransactionFilterSheet'
import {
  defaultTransactionFilters,
  type TransactionFiltersValue,
} from './transactionFilterUtils'

type TransactionFiltersProps = {
  accounts: Account[]
  categories: Category[]
  groups: Group[]
  value: TransactionFiltersValue
  onChange: (value: TransactionFiltersValue) => void
  onReset: () => void
}

export function TransactionFilters({
  accounts,
  categories,
  groups,
  onChange,
  onReset,
  value,
}: TransactionFiltersProps) {
  const [draftValue, setDraftValue] = useState(value)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  function openSheet() {
    setDraftValue(value)
    setIsSheetOpen(true)
  }

  function applyMobileFilters() {
    onChange(draftValue)
    setIsSheetOpen(false)
  }

  function resetMobileFilters() {
    setDraftValue(defaultTransactionFilters)
    onReset()
    setIsSheetOpen(false)
  }

  return (
    <>
      <TransactionFilterSheet
        accounts={accounts}
        categories={categories}
        groups={groups}
        isOpen={isSheetOpen}
        onApply={applyMobileFilters}
        onChange={setDraftValue}
        onClose={() => setIsSheetOpen(false)}
        onOpen={openSheet}
        onReset={resetMobileFilters}
        value={draftValue}
      />
      <TransactionFilterBar
        accounts={accounts}
        categories={categories}
        onChange={onChange}
        onReset={onReset}
        value={value}
      />
    </>
  )
}
