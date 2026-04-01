import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Gauge, Loader, Sparkles, Target } from 'lucide-react';
import { useFinancialWorkspace } from '../hooks/useFinancialWorkspace';
import MonthNavigator from '../components/Common/MonthNavigator';
import { AreaTrendChart } from '../components/finance/charts/AreaTrendChart';
import { loadPlanningConfig, savePlanningConfig } from '../services/planningConfigService';
import {
  buildGoalForecasts,
  buildGoalSimulator,
  buildProjectionSeries,
  formatCurrency,
  getMonthlyAverage,
} from '../utils/financeModels';

export const ForecastPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { loading, error, workspace } = useFinancialWorkspace(selectedDate);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState(150);
  const [configReady, setConfigReady] = useState(false);
  const lastAutoInitializedGoalRef = useRef(null);

  const primaryAccount = workspace?.primaryAccount ?? null;
  const allTransactions = workspace?.allTransactions ?? [];
  const savingsGoals = workspace?.savingsGoals ?? [];
  const monthlyCapacity = Math.max(
    getMonthlyAverage(allTransactions, 'income') - getMonthlyAverage(allTransactions, 'expense'),
    0
  );
  const projectionSeries = primaryAccount
    ? buildProjectionSeries(primaryAccount, allTransactions, savingsGoals, selectedDate, 8)
    : [];
  const goalForecasts = buildGoalForecasts(savingsGoals, allTransactions, monthlyCapacity, selectedDate);
  const selectedGoal = goalForecasts.find((goal) => goal.id === selectedGoalId) || goalForecasts[0] || null;
  const simulator = buildGoalSimulator(selectedGoal, monthlyContribution, selectedDate);

  useEffect(() => {
    let active = true;

    loadPlanningConfig().then((config) => {
      if (!active) return;
      if (config?.forecastGoalId) {
        setSelectedGoalId(config.forecastGoalId);
      }
      if (typeof config?.forecastMonthlyContribution === 'number') {
        setMonthlyContribution(config.forecastMonthlyContribution);
      }
      setConfigReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!workspace?.savingsGoals?.length) return;

    setSelectedGoalId((currentValue) => currentValue || workspace.savingsGoals[0].id);
  }, [workspace]);

  useEffect(() => {
    if (!selectedGoal) return;
    if (lastAutoInitializedGoalRef.current === selectedGoal.id) return;

    lastAutoInitializedGoalRef.current = selectedGoal.id;
    setMonthlyContribution(Math.max(25, Math.round(selectedGoal.suggestedMonthly || 150)));
  }, [selectedGoal?.id, selectedGoal?.suggestedMonthly]);

  useEffect(() => {
    if (!configReady || !selectedGoalId) return;
    savePlanningConfig({
      forecastGoalId: selectedGoalId,
      forecastMonthlyContribution: monthlyContribution,
    });
  }, [configReady, selectedGoalId, monthlyContribution]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_-12%,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.10),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)]">
        <Loader className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-12%,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.10),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-rose-600">{error || 'Erreur de chargement'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-12%,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.10),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)] py-5 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-slate-200/80 bg-white/92 p-4 shadow-sm sm:p-6 xl:p-7"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Projection
              </span>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl xl:text-[2.3rem]">
                Horizon de vos objectifs
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Simulez l’effort mensuel à fournir et voyez tout de suite si vos objectifs restent réalistes.
              </p>
            </div>

            <div className="xl:self-end">
              <MonthNavigator currentDate={selectedDate} onDateChange={setSelectedDate} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[26px] border border-emerald-200 bg-emerald-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/70">
                Capacité disponible
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-950">
                {formatCurrency(monthlyCapacity)}
              </p>
            </div>
            <div className="rounded-[26px] border border-sky-200 bg-sky-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700/70">
                Objectifs actifs
              </p>
              <p className="mt-2 text-2xl font-semibold text-sky-950">{goalForecasts.length}</p>
            </div>
            <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Horizon affiché
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">8 mois</p>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Trajectoire
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Évolution du solde disponible
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Cette courbe montre la place qui restera sur le compte après vos réserves d’épargne virtuelles.
              </p>
            </div>

            <div className="mt-6">
              <AreaTrendChart series={projectionSeries} accent="#14b8a6" />
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Simulateur
                </p>
                <h2 className="text-2xl font-semibold text-slate-950">Combien mettre par mois ?</h2>
              </div>
            </div>

            {selectedGoal ? (
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Objectif simulé</label>
                  <select
                    value={selectedGoal.id}
                    onChange={(event) => setSelectedGoalId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300"
                  >
                    {goalForecasts.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.icon} {goal.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/70 p-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Contribution mensuelle testée</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Ajustez ce montant pour voir la date d’atteinte changer en direct.
                      </p>
                    </div>
                    <p className="text-xl font-semibold text-slate-950">
                      {formatCurrency(monthlyContribution)}
                    </p>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.max(800, Math.round((selectedGoal.remaining || 0) / 2))}
                    step="25"
                    value={monthlyContribution}
                    onChange={(event) => setMonthlyContribution(Number(event.target.value))}
                    className="mt-4 w-full accent-emerald-600"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-slate-200/80 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Date estimée
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {simulator?.projectedDate
                        ? simulator.projectedDate.toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Impossible à projeter'}
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-slate-200/80 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Durée
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {simulator?.months ? `${simulator.months} mois` : '0 € / mois'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                  En injectant {formatCurrency(monthlyContribution)} par mois dans {selectedGoal.name}, vous couvririez encore {formatCurrency(simulator?.remaining || 0)} et pourriez viser une réalisation autour de{' '}
                  {simulator?.projectedDate
                    ? simulator.projectedDate.toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'la date restera indéfinie'}.
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
                Ajoutez un objectif d’épargne pour débloquer le simulateur.
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Feuille de route
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Objectifs et échéances estimées
              </h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {goalForecasts.length} objectifs
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {goalForecasts.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
                Aucun objectif actif à projeter.
              </div>
            )}

            {goalForecasts.map((goal) => (
              <div key={goal.id} className="rounded-[28px] border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.icon}</span>
                      <p className="font-semibold text-slate-900">{goal.name}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {formatCurrency(goal.current_amount)} sur {formatCurrency(goal.target_amount)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    goal.status === 'on-track'
                      ? 'bg-emerald-100 text-emerald-700'
                      : goal.status === 'stretch'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                  }`}>
                    {goal.status === 'on-track' && 'Sur la bonne voie'}
                    {goal.status === 'stretch' && 'Effort à renforcer'}
                    {goal.status === 'momentum' && 'Élan positif'}
                    {goal.status === 'stable' && 'À planifier'}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Effort conseillé
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {formatCurrency(goal.suggestedMonthly || 0)} / mois
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Date estimée
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {goal.projectedDate
                        ? goal.projectedDate.toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'À définir'}
                    </p>
                  </div>
                </div>

                {goal.target_date && (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm text-slate-600">
                    <CalendarClock className="h-4 w-4 text-slate-400" />
                    Date cible souhaitée: {' '}
                    <span className="font-semibold text-slate-900">
                      {new Date(goal.target_date).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
