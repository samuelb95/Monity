import { useMemo, useState, type FormEvent } from 'react'
import type {
  Account,
  Category,
  Group,
  Transaction,
  TransactionType,
  User,
} from '../../types/finance'
import { Button } from '../ui/Button'
import { TransactionAccountField } from './TransactionAccountField'
import { TransactionAmountField } from './TransactionAmountField'
import { TransactionCategoryField } from './TransactionCategoryField'
import { TransactionDateField } from './TransactionDateField'
import { TransactionDescriptionField } from './TransactionDescriptionField'
import {
  createConfirmedTransaction,
  getDefaultCategoryId,
  today,
  toOptions,
  validateTransactionForm,
  type FormErrors,
} from './transactionFormUtils'
import { TransactionGroupField } from './TransactionGroupField'
import { TransactionTypeSelector } from './TransactionTypeSelector'
import { TransferAccountsFields } from './TransferAccountsFields'

type TransactionFormProps = {
  accounts: Account[]
  categories: Category[]
  groups: Group[]
  initialTransaction?: Transaction
  submitLabel?: string
  user: User
  onCancel: () => void
  onSubmit: (transaction: Transaction) => void
}

export function TransactionForm({
  accounts,
  categories,
  groups,
  initialTransaction,
  onCancel,
  onSubmit,
  submitLabel = 'Ajouter',
  user,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(
    initialTransaction?.type ?? 'expense',
  )
  const [amount, setAmount] = useState(
    initialTransaction ? String(initialTransaction.amount) : '',
  )
  const [date, setDate] = useState(initialTransaction?.date ?? today)
  const [categoryId, setCategoryId] = useState(initialTransaction?.categoryId ?? '')
  const [description, setDescription] = useState(initialTransaction?.description ?? '')
  const [groupId, setGroupId] = useState(initialTransaction?.groupId ?? '')
  const [accountId, setAccountId] = useState(initialTransaction?.accountId ?? '')
  const [targetAccountId, setTargetAccountId] = useState(
    initialTransaction?.transferTargetAccountId ?? '',
  )
  const [errors, setErrors] = useState<FormErrors>({})

  const availableAccounts = useMemo(
    () => accounts.filter((account) => {
      if (account.ownerType === 'user') {
        return true
      }

      return Boolean(groupId && account.groupId === groupId)
    }),
    [accounts, groupId],
  )

  const accountOptions = toOptions(availableAccounts)
  const categoryOptions = categories
    .filter((category) => category.type === type)
    .map((category) => ({
      label: category.name,
      value: category.id,
    }))

  function resetForm() {
    setType('expense')
    setAmount('')
    setDate(today)
    setCategoryId('')
    setDescription('')
    setGroupId('')
    setAccountId('')
    setTargetAccountId('')
    setErrors({})
  }

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType)
    setCategoryId(getDefaultCategoryId(categories, nextType))
    setTargetAccountId('')
    setErrors({})
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(amount)
    const values = {
      accountId,
      amount: parsedAmount,
      categoryId,
      date,
      description,
      groupId,
      targetAccountId,
      type,
    }
    const nextErrors = validateTransactionForm(values)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit(createConfirmedTransaction(values, user, initialTransaction))
    resetForm()
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <TransactionTypeSelector onChange={handleTypeChange} value={type} />
      <TransactionAmountField
        error={errors.amount}
        onChange={setAmount}
        value={amount}
      />
      <TransactionDateField error={errors.date} onChange={setDate} value={date} />
      <TransactionCategoryField
        error={errors.categoryId}
        onChange={setCategoryId}
        options={categoryOptions}
        type={type}
        value={categoryId}
      />
      <TransactionGroupField
        onChange={(value) => {
          setGroupId(value)
          setAccountId('')
          setTargetAccountId('')
        }}
        options={toOptions(groups)}
        value={groupId}
      />
      <TransactionAccountField
        error={errors.account}
        onChange={setAccountId}
        options={accountOptions}
        type={type}
        value={accountId}
      />
      {type === 'transfer' ? (
        <TransferAccountsFields
          error={errors.target}
          onTargetAccountChange={setTargetAccountId}
          options={accountOptions}
          targetAccountId={targetAccountId}
        />
      ) : null}
      <TransactionDescriptionField
        onChange={setDescription}
        value={description}
      />
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Annuler
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
