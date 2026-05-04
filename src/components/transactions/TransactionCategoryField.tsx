import type { TransactionType } from '../../types/finance'
import { Select } from '../ui/Select'
import { FieldError } from './FieldError'
import type { FormOption } from './transactionFormUtils'

type TransactionCategoryFieldProps = {
  error?: string
  options: FormOption[]
  type: TransactionType
  value: string
  onChange: (value: string) => void
}

export function TransactionCategoryField({
  error,
  onChange,
  options,
  type,
  value,
}: TransactionCategoryFieldProps) {
  return (
    <>
      <Select
        label={type === 'income' ? 'Catégorie ou source' : 'Catégorie'}
        name="categoryId"
        onChange={(event) => onChange(event.target.value)}
        options={[{ label: 'Sélectionner une catégorie', value: '' }, ...options]}
        value={value}
      />
      <FieldError message={error} />
    </>
  )
}
