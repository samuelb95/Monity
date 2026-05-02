import { useMemo, useState } from 'react'
import { TransactionForm } from '../../components/transactions/TransactionForm'
import { TransactionList } from '../../components/transactions/TransactionList'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useFinanceData } from '../../context/useFinanceData'
import { getConfirmedTransactionsOnly } from '../../utils/calculations'

export function TransactionsPage() {
  const {
    accounts,
    addTransaction,
    groups,
    transactions,
    user,
  } = useFinanceData()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const confirmedTransactions = useMemo(
    () =>
      getConfirmedTransactionsOnly(transactions).toSorted(
        (first, second) =>
          new Date(second.date).getTime() - new Date(first.date).getTime(),
      ),
    [transactions],
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-2 text-text-secondary">
            Suivez les entrées, sorties et transferts confirmés de vos comptes.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Ajouter une transaction</Button>
      </div>

      <TransactionList accounts={accounts} transactions={confirmedTransactions} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter une transaction"
      >
        <TransactionForm
          accounts={accounts}
          groups={groups}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={(transaction) => {
            addTransaction(transaction)
            setIsModalOpen(false)
          }}
          user={user}
        />
      </Modal>
    </section>
  )
}
