import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, SlidersHorizontal, Target, WalletCards } from 'lucide-react';
import { useFinancialWorkspace } from '../hooks/useFinancialWorkspace';
import MonthNavigator from '../components/Common/MonthNavigator';
import { AllocationChart } from '../components/finance/charts/AllocationChart';
import { loadPlanningConfig, savePlanningConfig } from '../services/planningConfigService';
import {
  allocationBuckets,
  buildAllocationModel,
  buildBudgetPressure,
  formatCurrency,
  getStoredAllocationTargets,
  normalizeTargets,
  saveStoredAllocationTargets,
  summarizeTransactions,
  updateTargetsWithRedistribution,
} from '../utils/financeModels';

const presets = [
  {
    label: 'Base solide',
    values: [
      { key: 'essentials', value: 50 },
      { key: 'lifestyle', value: 20 },
      { key: 'goals', value: 20 },
      { key: 'buffer', value: 10 },
    ],
  },
  {
    label: 'Objectifs rapides',
    values: [
      { key: 'essentials', value: 40 },
      { key: 'lifestyle', value: 20 },
      { key: 'goals', value: 30 },
      { key: 'buffer', value: 10 },
    ],
  },
  {
    label: 'Souffle quotidien',
    values: [
      { key: 'essentials', value: 45 },
      { key: 'lifestyle', value: 30 },
      { key: 'goals', value: 15 },
      { key: 'buffer', value: 10 },
    ],
  },
];

export const PlannerPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [targets, setTargets] = useState(() => getStoredAllocationTargets());
  const [configReady, setConfigReady] = useState(false);
  const { loading, error, workspace } = useFinancialWorkspace(selectedDate);

  useEffect(() => {
    let active = true;

    loadPlanningConfig().then((config) => {
      if (!active) return;
      if (config?.allocationTargets?.length) {
        setTargets(normalizeTargets(config.allocationTargets));
      }
      setConfigReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!configReady) return;
    saveStoredAllocationTargets(targets);
    savePlanningConfig({ allocationTargets: targets });
  }, [configReady, targets]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_-12%,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.08),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)]">
        <Loader className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-12%,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.08),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-rose-600">{error || 'Erreur de chargement'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { monthTransactions, budgets, categories, balances } = workspace;
  const summary = summarizeTransactions(monthTransactions);
  const normalizedTargets = normalizeTargets(targets);
  const allocationRows = buildAllocationModel(monthTransactions, balances, normalizedTargets);
  const budgetPressure = buildBudgetPressure(budgets, categories, monthTransactions, summary.income);

  const recommendations = allocationRows
    .filter((row) => Math.abs(row.delta) > 25)
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-12%,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.08),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)] py-5 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-slate-200/80 bg-white/92 p-4 shadow-sm sm:p-6 xl:p-7"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                Plan
              </span>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl xl:text-[2.3rem]">
                Répartition cible du mois
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Ajustez votre allocation idéale et voyez immédiatement si la réalité du mois reste alignée.
              </p>
            </div>

            <div className="xl:self-end">
              <MonthNavigator currentDate={selectedDate} onDateChange={setSelectedDate} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Revenus analysés
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCurrency(summary.income)}
              </p>
            </div>
            <div className="rounded-[26px] border border-teal-200 bg-teal-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700/70">
                Marge disponible
              </p>
              <p className="mt-2 text-2xl font-semibold text-teal-950">
                {formatCurrency(balances.availableBalance)}
              </p>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.95fr)]">
          <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Allocation cible
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Réglez votre répartition idéale
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setTargets(normalizeTargets(preset.values))}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {allocationBuckets.map((bucket) => {
                const currentValue =
                  normalizedTargets.find((item) => item.key === bucket.key)?.value ?? bucket.defaultValue;
                const targetAmount = (summary.income * currentValue) / 100;

                return (
                  <div key={bucket.key} className="rounded-[28px] border border-slate-200/80 bg-slate-50/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{bucket.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{bucket.description}</p>
                      </div>
                      <div className="rounded-2xl px-3 py-2 text-right" style={{ backgroundColor: `${bucket.color}18` }}>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Cible
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">{currentValue}%</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentValue}
                        onChange={(event) =>
                          setTargets((currentTargets) =>
                            updateTargetsWithRedistribution(
                              currentTargets,
                              bucket.key,
                              Number(event.target.value)
                            )
                          )
                        }
                        className="w-full accent-sky-600"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                      <span>{formatCurrency(targetAmount)} à allouer sur vos revenus du mois</span>
                      <span className="font-semibold text-slate-700">{currentValue} / 100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Réalité du mois
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-950">Écart par rapport à votre plan</h2>
                </div>
              </div>

              <div className="mt-6">
                <AllocationChart rows={allocationRows} />
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Ajustements suggérés
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-950">Où corriger en premier</h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {recommendations.length === 0 && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-800">
                    Votre répartition actuelle est déjà proche de votre plan idéal sur ce mois.
                  </div>
                )}

                {recommendations.map((row) => (
                  <div key={row.key} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{row.label}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Réel {formatCurrency(row.actualAmount)} vs cible {formatCurrency(row.targetAmount)}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        row.delta > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {row.delta > 0 ? 'Au-dessus' : 'Sous la cible'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Budgets actifs
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-950">Enveloppes à surveiller</h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {budgetPressure.slice(0, 5).map((budget) => (
                  <div key={budget.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{budget.name}</p>
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        {budget.ratio.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${Math.min(budget.ratio, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
