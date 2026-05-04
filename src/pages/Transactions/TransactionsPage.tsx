import { useMemo, useState } from 'react'
import { TransactionFilters } from '../../components/transactions/TransactionFilters'
import {
  defaultTransactionFilters,
  filterTransactions,
  type TransactionFiltersValue,
} from '../../components/transactions/transactionFilterUtils'
import { TransactionForm } from '../../components/transactions/TransactionForm'
import { TransactionList } from '../../components/transactions/TransactionList'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useFinanceData } from '../../context/useFinanceData'
import type { Transaction } from '../../types/finance'
import { getConfirmedTransactionsOnly } from '../../utils/calculations'

export function TransactionsPage() {
  const {
    accounts,
    addTransaction,
    categories,
    deleteTransaction,
    groups,
    transactions,
    updateTransaction,
    user,
  } = useFinanceData()
  const [filters, setFilters] = useState<TransactionFiltersValue>(
    defaultTransactionFilters,
  )
  const [editingTransaction, setEditingTransaction] = useState<Transaction>()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const visibleTransactions = useMemo(
    () =>
      filterTransactions({
        categories,
        filters,
        transactions: getConfirmedTransactionsOnly(transactions),
      }).toSorted(
        (first, second) =>
          new Date(second.date).getTime() - new Date(first.date).getTime(),
      ),
    [categories, filters, transactions],
  )

  function openCreateModal() {
    setEditingTransaction(undefined)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingTransaction(undefined)
  }

  function handleDelete(transactionId: string) {
    if (window.confirm('Supprimer cette transaction ?')) {
      deleteTransaction(transactionId)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-2 text-text-secondary">
            Suivez les entrées, sorties et transferts confirmés de vos comptes.
          </p>
        </div>
        <Button onClick={openCreateModal}>Ajouter une transaction</Button>
      </div>

      <TransactionFilters
        accounts={accounts}
        categories={categories}
        groups={groups}
        onChange={setFilters}
        onReset={() => setFilters(defaultTransactionFilters)}
        value={filters}
      />

      <TransactionList
        accounts={accounts}
        categories={categories}
        groups={groups}
        onDeleteTransaction={handleDelete}
        onEditTransaction={(transaction) => {
          setEditingTransaction(transaction)
          setIsModalOpen(true)
        }}
        transactions={visibleTransactions}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTransaction ? 'Modifier la transaction' : 'Ajouter une transaction'}
      >
        <TransactionForm
          accounts={accounts}
          categories={categories}
          groups={groups}
          initialTransaction={editingTransaction}
          onCancel={closeModal}
          onSubmit={(transaction) => {
            if (editingTransaction) {
              updateTransaction(transaction)
            } else {
              addTransaction(transaction)
            }
            closeModal()
          }}
          submitLabel={editingTransaction ? 'Enregistrer' : 'Ajouter'}
          user={user}
        />
      </Modal>
    </section>
  )
}
