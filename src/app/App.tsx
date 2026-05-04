import { useEffect, useMemo, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { routes } from './routes'

const getCurrentPath = () => {
  const hashPath = window.location.hash.replace('#', '')
  return routes.some((route) => route.path === hashPath) ? hashPath : '/'
}

function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath)

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(getCurrentPath())

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0 })
  }, [currentPath])

  const activeRoute = useMemo(
    () => routes.find((route) => route.path === currentPath) ?? routes[0],
    [currentPath],
  )

  return (
    <AppLayout currentPath={activeRoute.path} routes={routes}>
      <activeRoute.Component />
    </AppLayout>
  )
}

export default App
