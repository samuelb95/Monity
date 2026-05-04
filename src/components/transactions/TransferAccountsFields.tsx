import { Select } from '../ui/Select'
import { FieldError } from './FieldError'
import type { FormOption } from './transactionFormUtils'

type TransferAccountsFieldsProps = {
  error?: string
  options: FormOption[]
  targetAccountId: string
  onTargetAccountChange: (value: string) => void
}

export function TransferAccountsFields({
  error,
  onTargetAccountChange,
  options,
  targetAccountId,
}: TransferAccountsFieldsProps) {
  return (
    <>
      <Select
        label="Compte destination"
        name="targetAccountId"
        onChange={(event) => onTargetAccountChange(event.target.value)}
        options={[{ label: 'Sélectionner un compte', value: '' }, ...options]}
        value={targetAccountId}
      />
      <FieldError message={error} />
    </>
  )
}
