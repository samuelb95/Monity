import { Select } from '../ui/Select'
import type { FormOption } from './transactionFormUtils'

type TransactionGroupFieldProps = {
  options: FormOption[]
  value: string
  onChange: (value: string) => void
}

export function TransactionGroupField({
  onChange,
  options,
  value,
}: TransactionGroupFieldProps) {
  return (
    <Select
      label="Lier à un groupe"
      name="groupId"
      onChange={(event) => onChange(event.target.value)}
      options={[{ label: 'Transaction personnelle', value: '' }, ...options]}
      value={value}
    />
  )
}
