import { Input } from '../ui/Input'
import { FieldError } from './FieldError'

type TransactionDateFieldProps = {
  error?: string
  value: string
  onChange: (value: string) => void
}

export function TransactionDateField({
  error,
  onChange,
  value,
}: TransactionDateFieldProps) {
  return (
    <>
      <Input
        label="Date"
        name="date"
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
      <FieldError message={error} />
    </>
  )
}
