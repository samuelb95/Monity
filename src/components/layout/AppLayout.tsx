import { useState } from 'react'
import type { ReactNode } from 'react'
import type { AppRoute } from '../../app/routes'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

type AppLayoutProps = {
  children: ReactNode
  currentPath: string
  routes: AppRoute[]
}

export function AppLayout({ children, currentPath, routes }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar
        currentPath={currentPath}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
        routes={routes}
      />
      <div
        className={[
          'min-h-screen pb-24 transition-[margin] duration-200 ease-out lg:pb-0',
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20',
        ].join(' ')}
      >
        <TopBar />
        <main className="min-h-[calc(100vh-4rem)] w-full px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
      <MobileNav currentPath={currentPath} routes={routes} />
    </div>
  )
}
