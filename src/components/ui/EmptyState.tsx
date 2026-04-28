import { Card } from './Card'

type EmptyStateProps = {
  title: string
  description: string
}

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <Card className="flex min-h-[22rem] items-center justify-center overflow-hidden text-center">
      <div className="mx-auto w-full max-w-lg min-w-0">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-card bg-primary/15 text-primary ring-1 ring-primary/25">
          <span className="text-lg font-semibold" aria-hidden="true">
            M
          </span>
        </div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary break-words">
          {description}
        </p>
      </div>
    </Card>
  )
}
