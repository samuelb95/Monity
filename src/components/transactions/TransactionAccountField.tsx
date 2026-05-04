import type { TransactionType } from '../../types/finance'
import { Select } from '../ui/Select'
import { FieldError } from './FieldError'
import type { FormOption } from './transactionFormUtils'

type TransactionAccountFieldProps = {
  error?: string
  options: FormOption[]
  type: TransactionType
  value: string
  onChange: (value: string) => void
}

export function TransactionAccountField({
  error,
  onChange,
  options,
  type,
  value,
}: TransactionAccountFieldProps) {
  return (
    <>
      <Select
        label={type === 'transfer' ? 'Compte source' : 'Payé avec'}
        name="accountId"
        onChange={(event) => onChange(event.target.value)}
        options={[{ label: 'Sélectionner un compte', value: '' }, ...options]}
        value={value}
      />
      <FieldError message={error} />
    </>
  )
}
