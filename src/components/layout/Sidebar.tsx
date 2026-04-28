import type { AppRoute } from '../../app/routes'
import { Logo } from '../brand/Logo'

type SidebarProps = {
  currentPath: string
  isOpen: boolean
  routes: AppRoute[]
}

export function Sidebar({ currentPath, isOpen, routes }: SidebarProps) {
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface px-5 py-6 transition-transform duration-200 ease-out lg:block',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
      aria-hidden={!isOpen}
    >
      <Logo size="lg" />

      <nav className="mt-8 space-y-1" aria-label="Navigation principale">
        {routes
          .filter((route) => route.showInSidebar !== false)
          .map((route) => {
            const isActive = route.path === currentPath

            return (
              <a
                key={route.path}
                href={`#${route.path}`}
                className={[
                  'block rounded-button px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary/15 text-primary ring-1 ring-primary/25'
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                ].join(' ')}
              >
                {route.label}
              </a>
            )
          })}
      </nav>
    </aside>
  )
}
