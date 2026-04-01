import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Edit,
  Loader,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useFinancialWorkspace } from '../hooks/useFinancialWorkspace';
import {
  buildAllocationModel,
  buildBudgetPressure,
  buildGoalForecasts,
  buildProjectionSeries,
  formatCurrency,
  formatMonthLabel,
  getMonthlyAverage,
  getStoredAllocationTargets,
  summarizeTransactions,
} from '../utils/financeModels';
import { AreaTrendChart } from '../components/finance/charts/AreaTrendChart';
import { AllocationChart } from '../components/finance/charts/AllocationChart';
import MonthNavigator from '../components/Common/MonthNavigator';
import AddTransactionModal from '../components/Transactions/AddTransactionModal';
import AddSavingsGoalModal from '../components/SavingsGoals/AddSavingsGoalModal';
import EditTransactionModal from '../components/Transactions/EditTransactionModal';
import {
  validateOccurrence,
  validateTransaction,
  unvalidateTransaction,
} from '../services/supabaseService';

function getGoalTone(status) {
  if (status === 'on-track') return 'bg-emerald-100 text-emerald-700';
  if (status === 'stretch') return 'bg-amber-100 text-amber-700';
  if (status === 'momentum') return 'bg-sky-100 text-sky-700';
  return 'bg-slate-100 text-slate-700';
}

export const DashboardPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showSavingsGoalModal, setShowSavingsGoalModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { loading, error, workspace, refresh } = useFinancialWorkspace(selectedDate);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_-12%,rgba(14,165,233,0.15),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.08),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)]">
        <Loader className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-12%,rgba(14,165,233,0.15),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.08),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-rose-600">{error || 'Erreur de chargement'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { primaryAccount, allTransactions, monthTransactions, budgets, savingsGoals, categories, balances } = workspace;
  const summary = summarizeTransactions(monthTransactions);
  const allocationRows = buildAllocationModel(
    monthTransactions,
    balances,
    getStoredAllocationTargets()
  );
  const budgetPressure = buildBudgetPressure(
    budgets,
    categories,
    monthTransactions,
    summary.income
  ).slice(0, 4);
  const monthlyCapacity = Math.max(
    getMonthlyAverage(allTransactions, 'income') - getMonthlyAverage(allTransactions, 'expense'),
    0
  );
  const projectionSeries = buildProjectionSeries(
    primaryAccount,
    allTransactions,
    savingsGoals,
    selectedDate,
    6
  );
  const goalForecasts = buildGoalForecasts(
    savingsGoals,
    allTransactions,
    monthlyCapacity,
    selectedDate
  ).slice(0, 3);
  const displayedTransactions = monthTransactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-12%,rgba(14,165,233,0.15),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.08),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)] py-5 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] p-4 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.35)] sm:p-6 xl:p-7"
        >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        
        {/* LEFT */}
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
            Vue d’ensemble
          </span>

          <h1 className="mt-3 text-1xl font-semibold tracking-tight text-slate-950 sm:text-xl xl:text-[2rem]">
            Vision rapide de votre mois
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Revenus, dépenses, solde projeté et objectifs visibles dès l’ouverture pour piloter sans perdre l’écran dans le décor.
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-start gap-3 xl:items-end">
          
          {/* Month selector */}
          <MonthNavigator
            currentDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* Buttons under it */}
          <div className="flex flex-wrap gap-2.5 xl:justify-end">
            <button
              onClick={() => setShowTransactionModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              transaction
            </button>

            <button
              onClick={() => setShowSavingsGoalModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Target className="h-4 w-4" />
              Nouvel objectif
            </button>
          </div>
        </div>
      </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">


            <div className="rounded-[26px] border border-emerald-200/80 bg-emerald-50/90 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-emerald-900/70">Revenus du mois</p>
                <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-emerald-950">{formatCurrency(summary.income)}</p>
            </div>

            <div className="rounded-[26px] border border-rose-200/80 bg-rose-50/90 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-rose-900/70">Dépenses du mois</p>
                <ArrowUpRight className="h-5 w-5 text-rose-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-rose-950">{formatCurrency(summary.expenses)}</p>
            </div>

            <div className="rounded-[26px] border border-sky-200/80 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-sky-900/70">Solde disponible projeté</p>
                  <p className="mt-2 text-2xl font-semibold text-sky-950">{formatCurrency(balances.availableBalance)}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-sky-600" />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Capacité mensuelle estimée: <span className="font-semibold text-slate-700">{formatCurrency(monthlyCapacity)}</span>
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">Objectifs actifs</p>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{savingsGoals.length}</p>
              <p className="mt-2 text-sm text-slate-500">
                {goalForecasts.length ? 'Avec une feuille de route calculée' : 'Prêts à être planifiés'}
              </p>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Projection
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Trajectoire de trésorerie sur 6 mois
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Une lecture simple de votre solde disponible si vous gardez le rythme actuel.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Départ
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {formatCurrency(balances.realBalance)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <AreaTrendChart series={projectionSeries} accent="#0ea5e9" />
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Budgets
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Zones de friction
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {budgetPressure.length} suivis
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {budgetPressure.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
                    Aucun budget actif pour le moment. Vous pourrez les piloter plus finement depuis la page Plan.
                  </div>
                )}

                {budgetPressure.map((budget) => (
                  <div key={budget.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{budget.name}</p>
                        <p className="text-sm text-slate-500">
                          {formatCurrency(budget.spent)} consommés sur {formatCurrency(budget.effectiveLimit)}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        budget.ratio >= 100
                          ? 'bg-rose-100 text-rose-700'
                          : budget.ratio >= (budget.alert_threshold || 80)
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {budget.ratio.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          budget.ratio >= 100
                            ? 'bg-rose-500'
                            : budget.ratio >= (budget.alert_threshold || 80)
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.min(budget.ratio, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Activité
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Mouvements récents
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {displayedTransactions.length} affichés
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {displayedTransactions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
                    Aucune transaction sur cette période.
                  </div>
                )}

                {displayedTransactions.map((transaction) => (
                  <div
                    key={`${transaction.id}-${transaction.date}`}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        transaction.type === 'income' ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">{transaction.description}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>
                            {new Date(transaction.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          {transaction.is_recurring && (
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">Récurrent</span>
                          )}
                          {transaction.savings_goal_id && (
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-teal-700">Objectif</span>
                          )}
                          {transaction.is_validated && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">Validé</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>

                      <button
                        onClick={async () => {
                          try {
                            if (transaction.is_occurrence) {
                              await validateOccurrence(transaction.id, transaction.occurrence_date);
                            } else if (transaction.is_validated) {
                              await unvalidateTransaction(transaction.id);
                            } else {
                              await validateTransaction(transaction.id);
                            }
                            refresh();
                          } catch (actionError) {
                            console.error('Erreur validation transaction:', actionError);
                          }
                        }}
                        className={`rounded-lg p-2 transition-colors ${
                          transaction.is_validated
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'text-slate-400 hover:bg-slate-200 hover:text-emerald-700'
                        }`}
                        title="Valider"
                      >
                        <Check className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowEditModal(true);
                        }}
                        className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-sky-100 hover:text-sky-700 group-hover:opacity-100"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Répartition
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Réel vs cible du mois
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Une lecture directe de la façon dont votre budget se distribue aujourd’hui.
                </p>
              </div>

              <div className="mt-6">
                <AllocationChart rows={allocationRows} />
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Objectifs
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Priorités de progression
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                {goalForecasts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
                    Créez un objectif pour commencer à projeter vos dates d’atteinte.
                  </div>
                )}

                {goalForecasts.map((goal) => (
                  <div key={goal.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{goal.icon}</span>
                          <p className="truncate font-semibold text-slate-900">{goal.name}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          Reste {formatCurrency(goal.remaining)} pour atteindre {formatCurrency(goal.target_amount)}.
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getGoalTone(goal.status)}`}>
                        {goal.status === 'on-track' && 'Sur la bonne voie'}
                        {goal.status === 'stretch' && 'À renforcer'}
                        {goal.status === 'momentum' && 'En mouvement'}
                        {goal.status === 'stable' && 'À planifier'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/90 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Effort recommandé
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {formatCurrency(goal.suggestedMonthly || 0)} / mois
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/90 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Date estimée
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {goal.projectedDate
                            ? goal.projectedDate.toLocaleDateString('fr-FR', {
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'À définir'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        accountId={primaryAccount.id}
        onTransactionAdded={refresh}
      />

      <AddSavingsGoalModal
        isOpen={showSavingsGoalModal}
        onClose={() => setShowSavingsGoalModal(false)}
        accountId={primaryAccount.id}
        onGoalAdded={refresh}
      />

      <EditTransactionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onTransactionUpdated={refresh}
      />
    </div>
  );
};
