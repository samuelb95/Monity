import { Input } from '../ui/Input'
import { FieldError } from './FieldError'

type TransactionAmountFieldProps = {
  error?: string
  value: string
  onChange: (value: string) => void
}

export function TransactionAmountField({
  error,
  onChange,
  value,
}: TransactionAmountFieldProps) {
  return (
    <>
      <Input
        inputMode="decimal"
        label="Montant"
        min="0"
        name="amount"
        onChange={(event) => onChange(event.target.value)}
        placeholder="0,00"
        step="0.01"
        type="number"
        value={value}
      />
      <FieldError message={error} />
    </>
  )
}
