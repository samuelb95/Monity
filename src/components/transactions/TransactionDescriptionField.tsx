import { Input } from '../ui/Input'

type TransactionDescriptionFieldProps = {
  value: string
  onChange: (value: string) => void
}

export function TransactionDescriptionField({
  onChange,
  value,
}: TransactionDescriptionFieldProps) {
  return (
    <Input
      label="Description"
      name="description"
      onChange={(event) => onChange(event.target.value)}
      placeholder="Optionnel"
      value={value}
    />
  )
}
