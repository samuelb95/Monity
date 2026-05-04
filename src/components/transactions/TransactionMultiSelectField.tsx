import { useEffect, useId, useRef, useState } from 'react'
import {
  closeTransactionFilterMenus,
  filterMenuCloseEvent,
  filterMenuOpenEvent,
} from './transactionMenuEvents'

type MultiSelectOption = {
  label: string
  value: string
}

type TransactionMultiSelectFieldProps = {
  label: string
  options: MultiSelectOption[]
  values: string[]
  className?: string
  onChange: (values: string[]) => void
}

export function TransactionMultiSelectField({
  className = 'min-w-0 flex-1',
  label,
  onChange,
  options,
  values,
}: TransactionMultiSelectFieldProps) {
  const fieldId = useId()
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const summary =
    values.length === 0 ? 'Toutes' : `${values.length} sélectionnée(s)`

  useEffect(() => {
    function closeFromExternalEvent(event: Event) {
      const customEvent = event as CustomEvent<{ fieldId?: string }>

      if (customEvent.detail?.fieldId !== fieldId) {
        setIsOpen(false)
      }
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (!detailsRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener(filterMenuOpenEvent, closeFromExternalEvent)
    document.addEventListener(filterMenuCloseEvent, closeFromExternalEvent)
    document.addEventListener('mousedown', closeOnOutsideClick)

    return () => {
      document.removeEventListener(filterMenuOpenEvent, closeFromExternalEvent)
      document.removeEventListener(filterMenuCloseEvent, closeFromExternalEvent)
      document.removeEventListener('mousedown', closeOnOutsideClick)
    }
  }, [fieldId])

  function toggleMenu() {
    const nextIsOpen = !isOpen
    setIsOpen(nextIsOpen)

    if (nextIsOpen) {
      document.dispatchEvent(
        new CustomEvent(filterMenuOpenEvent, { detail: { fieldId } }),
      )
    } else {
      closeTransactionFilterMenus()
    }
  }

  function toggleValue(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value))
      return
    }

    onChange([...values, value])
  }

  return (
    <details className={`group relative ${className}`} open={isOpen} ref={detailsRef}>
      <summary
        className="block cursor-pointer list-none text-xs font-medium text-text-secondary [&::-webkit-details-marker]:hidden"
        onClick={(event) => {
          event.preventDefault()
          toggleMenu()
        }}
      >
        <span className="mb-1 block">{label}</span>
        <span className="flex h-10 items-center justify-between rounded-button border border-border bg-background px-3 text-sm text-text-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <span className="truncate">{summary}</span>
          <span className="text-text-secondary" aria-hidden="true">⌄</span>
        </span>
      </summary>
      <div className="absolute left-0 top-16 z-20 max-h-64 w-56 overflow-y-auto rounded-card border border-border bg-surface-elevated p-2 shadow-card">
        {options.map((option) => (
          <label
            className="flex cursor-pointer items-center gap-2 rounded-button px-2 py-2 text-sm text-text-primary hover:bg-surface"
            key={option.value}
          >
            <input
              checked={values.includes(option.value)}
              className="h-4 w-4 accent-primary"
              onChange={() => toggleValue(option.value)}
              type="checkbox"
            />
            <span className="truncate">{option.label}</span>
          </label>
        ))}
      </div>
    </details>
  )
}
