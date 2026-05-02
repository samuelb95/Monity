import { useMemo, useState, type FormEvent } from 'react'
import type { Account, Group, Transaction, TransactionType, User } from '../../types/finance'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import {
  createConfirmedTransaction,
  today,
  toOptions,
  validateTransactionForm,
  type FormErrors,
} from './transactionFormUtils'
import { FieldError } from './FieldError'
import { TransactionTypeSelector } from './TransactionTypeSelector'

type TransactionFormProps = {
  accounts: Account[]
  groups: Group[]
  user: User
  onCancel: () => void
  onSubmit: (transaction: Transaction) => void
}

export function TransactionForm({
  accounts,
  groups,
  onCancel,
  onSubmit,
  user,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [groupId, setGroupId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [targetAccountId, setTargetAccountId] = useState('')
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

  function resetForm() {
    setType('expense')
    setAmount('')
    setDate(today)
    setCategory('')
    setDescription('')
    setGroupId('')
    setAccountId('')
    setTargetAccountId('')
    setErrors({})
  }

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType)
    setCategory('')
    setTargetAccountId('')
    setErrors({})
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(amount)
    const values = {
      accountId,
      amount: parsedAmount,
      category,
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

    onSubmit(createConfirmedTransaction(values, user))
    resetForm()
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <TransactionTypeSelector onChange={handleTypeChange} value={type} />
      <Input
        inputMode="decimal"
        label="Montant"
        min="0"
        name="amount"
        onChange={(event) => setAmount(event.target.value)}
        placeholder="0,00"
        step="0.01"
        type="number"
        value={amount}
      />
      <FieldError message={errors.amount} />
      <Input
        label="Date"
        name="date"
        onChange={(event) => setDate(event.target.value)}
        type="date"
        value={date}
      />
      <FieldError message={errors.date} />
      {type !== 'transfer' ? (
        <>
          <Input
            label={type === 'income' ? 'Catégorie ou source' : 'Catégorie'}
            name="category"
            onChange={(event) => setCategory(event.target.value)}
            placeholder={type === 'income' ? 'Salaire, remboursement...' : 'Courses, loyer...'}
            value={category}
          />
          <FieldError message={errors.category} />
        </>
      ) : null}
      <Select
        label="Lier à un groupe"
        name="groupId"
        onChange={(event) => {
          setGroupId(event.target.value)
          setAccountId('')
          setTargetAccountId('')
        }}
        options={[{ label: 'Transaction personnelle', value: '' }, ...toOptions(groups)]}
        value={groupId}
      />
      <Select
        label={type === 'transfer' ? 'Compte source' : 'Payé avec'}
        name="accountId"
        onChange={(event) => setAccountId(event.target.value)}
        options={[{ label: 'Sélectionner un compte', value: '' }, ...accountOptions]}
        value={accountId}
      />
      <FieldError message={errors.account} />
      {type === 'transfer' ? (
        <>
          <Select
            label="Compte destination"
            name="targetAccountId"
            onChange={(event) => setTargetAccountId(event.target.value)}
            options={[{ label: 'Sélectionner un compte', value: '' }, ...accountOptions]}
            value={targetAccountId}
          />
          <FieldError message={errors.target} />
        </>
      ) : null}
      <Input
        label="Description"
        name="description"
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Optionnel"
        value={description}
      />
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Annuler
        </Button>
        <Button type="submit">Ajouter</Button>
      </div>
    </form>
  )
}
