import { Logo } from '../brand/Logo'

type TopBarProps = {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function TopBar({ isSidebarOpen, onToggleSidebar }: TopBarProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <Logo size="sm" variant="mark" />
        </div>
        <button
          aria-label={isSidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
          aria-pressed={isSidebarOpen}
          className="hidden h-10 w-10 items-center justify-center rounded-button border border-border text-text-secondary transition hover:bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background lg:inline-flex"
          onClick={onToggleSidebar}
          type="button"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
              d="M4 6h16M4 12h12M4 18h16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-secondary">
            Une base claire pour piloter vos finances.
          </p>
        </div>
      </div>
    </header>
  )
}
