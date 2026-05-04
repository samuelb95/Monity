import { useMemo, useState, type ReactNode } from 'react'
import { createFinanceDataActions } from './financeActions'
import {
  FinanceDataContext,
  initialFinanceData,
  type FinanceDataContextValue,
  type FinanceDataState,
} from './financeData'

type FinanceDataProviderProps = {
  children: ReactNode
}

export function FinanceDataProvider({ children }: FinanceDataProviderProps) {
  const [data, setData] = useState<FinanceDataState>(() => initialFinanceData)

  const actions = useMemo(() => createFinanceDataActions(setData), [])

  const value = useMemo<FinanceDataContextValue>(
    () => ({ ...data, ...actions }),
    [actions, data],
  )

  return (
    <FinanceDataContext.Provider value={value}>
      {children}
    </FinanceDataContext.Provider>
  )
}
