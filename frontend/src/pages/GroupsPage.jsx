import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRightLeft,
  Coins,
  Loader,
  Plus,
  ReceiptText,
  Users,
  Wallet,
} from 'lucide-react';
import MonthNavigator from '../components/Common/MonthNavigator';
import {
  addExpenseGroupMember,
  createExpenseGroup,
  createExpenseGroupEntry,
  getExpenseGroups,
  updateExpenseGroup,
} from '../services/groupService';
import { formatCurrency, formatMonthLabel } from '../utils/financeModels';
import { buildExpenseGroupSnapshot } from '../utils/groupModels';

function getTodayInputValue() {
  return new Date().toISOString().split('T')[0];
}

function getInitialEntryForm(memberId = '') {
  return {
    entry_type: 'expense',
    description: '',
    amount: '',
    entry_date: getTodayInputValue(),
    paid_from: 'member',
    paid_by_member_id: memberId,
    is_recurring: false,
    recurrence_pattern: 'monthly',
    recurrence_end_date: '',
    notes: '',
  };
}

export const GroupsPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [entrySubmitting, setEntrySubmitting] = useState(false);
  const [sharedAccountSubmitting, setSharedAccountSubmitting] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    shared_account_enabled: true,
    shared_account_name: 'Compte commun',
    shared_account_balance: '',
  });
  const [memberForm, setMemberForm] = useState({
    display_name: '',
    email: '',
    share_ratio: '1',
  });
  const [entryForm, setEntryForm] = useState(getInitialEntryForm());
  const [sharedAccountForm, setSharedAccountForm] = useState({
    shared_account_enabled: false,
    shared_account_name: '',
    shared_account_balance: '',
  });

  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) || groups[0] || null;
  const snapshot = selectedGroup
    ? buildExpenseGroupSnapshot(
        selectedGroup,
        selectedGroup.members,
        selectedGroup.entries,
        selectedDate
      )
    : null;

  const loadGroups = async (preferredGroupId) => {
    try {
      setLoading(true);
      const data = await getExpenseGroups();
      setGroups(data);
      setError('');

      const nextSelectedId =
        data.find((group) => group.id === preferredGroupId)?.id ||
        data.find((group) => group.id === selectedGroupId)?.id ||
        data[0]?.id ||
        '';

      setSelectedGroupId(nextSelectedId);
    } catch (err) {
      console.error('Erreur chargement groupes:', err);
      setError(err.message || 'Impossible de charger les groupes.');
      setGroups([]);
      setSelectedGroupId('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setEntryForm(getInitialEntryForm());
      setSharedAccountForm({
        shared_account_enabled: false,
        shared_account_name: '',
        shared_account_balance: '',
      });
      return;
    }

    setEntryForm((currentForm) => ({
      ...currentForm,
      paid_by_member_id:
        currentForm.paid_by_member_id || selectedGroup.members[0]?.id || '',
      paid_from:
        currentForm.paid_from === 'shared_account' && !selectedGroup.shared_account_enabled
          ? 'member'
          : currentForm.paid_from,
    }));

    setSharedAccountForm({
      shared_account_enabled: Boolean(selectedGroup.shared_account_enabled),
      shared_account_name: selectedGroup.shared_account_name || 'Compte commun',
      shared_account_balance: String(selectedGroup.shared_account_balance || 0),
    });
  }, [selectedGroup?.id]);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setGroupSubmitting(true);
    setError('');

    try {
      const createdGroup = await createExpenseGroup(groupForm);
      setGroupForm({
        name: '',
        description: '',
        shared_account_enabled: true,
        shared_account_name: 'Compte commun',
        shared_account_balance: '',
      });
      await loadGroups(createdGroup.id);
    } catch (err) {
      console.error('Erreur création groupe:', err);
      setError(err.message || 'Impossible de créer le groupe.');
    } finally {
      setGroupSubmitting(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!selectedGroup) return;

    setMemberSubmitting(true);
    setError('');

    try {
      await addExpenseGroupMember(selectedGroup.id, memberForm);
      setMemberForm({
        display_name: '',
        email: '',
        share_ratio: '1',
      });
      await loadGroups(selectedGroup.id);
    } catch (err) {
      console.error('Erreur ajout membre:', err);
      setError(err.message || 'Impossible d’ajouter le membre.');
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleCreateEntry = async (event) => {
    event.preventDefault();
    if (!selectedGroup) return;

    setEntrySubmitting(true);
    setError('');

    try {
      const payload = {
        ...entryForm,
        group_id: selectedGroup.id,
        paid_from: entryForm.entry_type === 'funding' ? 'member' : entryForm.paid_from,
        paid_by_member_id: entryForm.paid_by_member_id || null,
      };

      await createExpenseGroupEntry(payload);
      setEntryForm(getInitialEntryForm(selectedGroup.members[0]?.id || ''));
      await loadGroups(selectedGroup.id);
    } catch (err) {
      console.error('Erreur ajout entrée groupe:', err);
      setError(err.message || 'Impossible d’ajouter cette écriture.');
    } finally {
      setEntrySubmitting(false);
    }
  };

  const handleSaveSharedAccount = async (event) => {
    event.preventDefault();
    if (!selectedGroup) return;

    setSharedAccountSubmitting(true);
    setError('');

    try {
      await updateExpenseGroup(selectedGroup.id, {
        shared_account_enabled: sharedAccountForm.shared_account_enabled,
        shared_account_name: sharedAccountForm.shared_account_enabled
          ? sharedAccountForm.shared_account_name
          : null,
        shared_account_balance: sharedAccountForm.shared_account_enabled
          ? sharedAccountForm.shared_account_balance
          : 0,
      });
      await loadGroups(selectedGroup.id);
    } catch (err) {
      console.error('Erreur mise à jour compte commun:', err);
      setError(err.message || 'Impossible de mettre à jour le compte commun.');
    } finally {
      setSharedAccountSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_-12%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.08),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)]">
        <Loader className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-12%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.08),transparent_34%),linear-gradient(180deg,#f7fafc_0%,#edf4f9_100%)] py-5 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-slate-200/80 bg-white/92 p-4 shadow-sm sm:p-6 xl:p-7"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                Groupes
              </span>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl xl:text-[2.3rem]">
                Dépenses partagées et dettes nettes
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Créez un groupe, choisissez qui paye quoi, distinguez les dépenses réglées en direct des prélèvements sur compte commun et suivez qui doit combien.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 xl:items-end">
              <div className="w-full xl:w-auto xl:self-end">
                <MonthNavigator currentDate={selectedDate} onDateChange={setSelectedDate} />
              </div>
              {selectedGroup && (
                <select
                  value={selectedGroup.id}
                  onChange={(event) => setSelectedGroupId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-300 xl:min-w-[18rem]"
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {snapshot && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[26px] border border-slate-200 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Période analysée
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatMonthLabel(selectedDate)}
                </p>
              </div>
              <div className="rounded-[26px] border border-sky-200 bg-sky-50/90 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700/70">
                  Dépenses du groupe
                </p>
                <p className="mt-2 text-2xl font-semibold text-sky-950">
                  {formatCurrency(snapshot.summary.totalExpenses, 2)}
                </p>
              </div>
              <div className="rounded-[26px] border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700/70">
                  À réalimenter
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-950">
                  {formatCurrency(snapshot.summary.sharedAccountTopUpNeeded, 2)}
                </p>
              </div>
              <div className="rounded-[26px] border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/70">
                  Transferts suggérés
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-950">
                  {snapshot.transfers.length}
                </p>
              </div>
            </div>
          )}
        </motion.section>

        {error && (
          <div className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
              <div>
                <p className="font-semibold">Point d’attention</p>
                <p className="mt-1">{error}</p>
                {error.includes('SHARED_EXPENSE_GROUPS_SCHEMA.sql') && (
                  <p className="mt-2 text-amber-800/90">
                    Script à exécuter: [SHARED_EXPENSE_GROUPS_SCHEMA.sql](C:\Users\Samue\Desktop\project\Monity - Copie\SHARED_EXPENSE_GROUPS_SCHEMA.sql)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedGroup ? (
          <section className="mt-6 rounded-[32px] border border-slate-200/80 bg-white/92 p-5 shadow-sm sm:p-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Premier groupe
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Créez votre espace partagé
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Exemple: couple, colocation, vacances, dépenses bébé ou tout autre budget commun avec une répartition claire.
              </p>
            </div>

            <form onSubmit={handleCreateGroup} className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Nom du groupe</span>
                <input
                  required
                  value={groupForm.name}
                  onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                  placeholder="Couple - charges fixes"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Description</span>
                <input
                  value={groupForm.description}
                  onChange={(event) => setGroupForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                  placeholder="Loyer, charges, courses, sorties..."
                />
              </label>

              <label className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={groupForm.shared_account_enabled}
                  onChange={(event) =>
                    setGroupForm((current) => ({
                      ...current,
                      shared_account_enabled: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-sky-600"
                />
                Activer un compte commun
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Solde actuel du compte commun</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={groupForm.shared_account_balance}
                  onChange={(event) =>
                    setGroupForm((current) => ({
                      ...current,
                      shared_account_balance: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                  placeholder="0.00"
                />
              </label>

              {groupForm.shared_account_enabled && (
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Nom du compte commun</span>
                  <input
                    value={groupForm.shared_account_name}
                    onChange={(event) =>
                      setGroupForm((current) => ({
                        ...current,
                        shared_account_name: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Compte commun"
                  />
                </label>
              )}

              <button
                type="submit"
                disabled={groupSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60 lg:col-span-2 lg:w-fit"
              >
                <Plus className="h-4 w-4" />
                {groupSubmitting ? 'Création...' : 'Créer le groupe'}
              </button>
            </form>
          </section>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.35fr)]">
            <div className="space-y-6">
              <section className="rounded-[32px] border border-slate-200/80 bg-white/92 p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Groupe actif
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      {selectedGroup.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedGroup.description || 'Répartition partagée sans ambiguïté entre les membres.'}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {snapshot?.members.map((member) => (
                    <div key={member.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{member.display_name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {member.sharePercentage}% du groupe
                            {member.email ? ` • ${member.email}` : ''}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          ratio {member.share_ratio}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Balance directe
                          </p>
                          <p className={`mt-2 text-lg font-semibold ${member.directBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {member.directBalance >= 0 ? '+' : ''}{formatCurrency(member.directBalance, 2)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Compte commun
                          </p>
                          <p className={`mt-2 text-lg font-semibold ${member.sharedContributionDelta >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {member.sharedContributionDelta >= 0 ? '+' : ''}{formatCurrency(member.sharedContributionDelta, 2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200/80 bg-white/92 p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Membres
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-950">Ajouter un membre</h2>
                  </div>
                </div>

                <form onSubmit={handleAddMember} className="mt-5 space-y-4">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Nom affiché</span>
                    <input
                      required
                      value={memberForm.display_name}
                      onChange={(event) =>
                        setMemberForm((current) => ({
                          ...current,
                          display_name: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                      placeholder="Alice"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Email optionnel</span>
                    <input
                      type="email"
                      value={memberForm.email}
                      onChange={(event) =>
                        setMemberForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                      placeholder="alice@email.com"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Ratio de répartition</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={memberForm.share_ratio}
                      onChange={(event) =>
                        setMemberForm((current) => ({
                          ...current,
                          share_ratio: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                      placeholder="1"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={memberSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Users className="h-4 w-4" />
                    {memberSubmitting ? 'Ajout...' : 'Ajouter'}
                  </button>
                </form>
              </section>

              <section className="rounded-[32px] border border-slate-200/80 bg-white/92 p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Compte commun
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-950">Paramètres du pot</h2>
                  </div>
                </div>

                <form onSubmit={handleSaveSharedAccount} className="mt-5 space-y-4">
                  <label className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={sharedAccountForm.shared_account_enabled}
                      onChange={(event) =>
                        setSharedAccountForm((current) => ({
                          ...current,
                          shared_account_enabled: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-sky-600"
                    />
                    Activer un compte commun pour ce groupe
                  </label>

                  {sharedAccountForm.shared_account_enabled && (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">Nom du compte</span>
                        <input
                          value={sharedAccountForm.shared_account_name}
                          onChange={(event) =>
                            setSharedAccountForm((current) => ({
                              ...current,
                              shared_account_name: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">Solde actuel</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={sharedAccountForm.shared_account_balance}
                          onChange={(event) =>
                            setSharedAccountForm((current) => ({
                              ...current,
                              shared_account_balance: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                        />
                      </label>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={sharedAccountSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <Wallet className="h-4 w-4" />
                    {sharedAccountSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </form>
              </section>

              <section className="rounded-[32px] border border-slate-200/80 bg-white/92 p-5 shadow-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Nouveau groupe
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Ouvrir un autre groupe
                </h2>

                <form onSubmit={handleCreateGroup} className="mt-5 space-y-4">
                  <input
                    required
                    value={groupForm.name}
                    onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Vacances été"
                  />
                  <input
                    value={groupForm.description}
                    onChange={(event) => setGroupForm((current) => ({ ...current, description: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                    placeholder="Transports, hébergements, sorties..."
                  />
                  <button
                    type="submit"
                    disabled={groupSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    {groupSubmitting ? 'Création...' : 'Créer'}
                  </button>
                </form>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-[32px] border border-slate-200/80 bg-white/92 p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Settlement
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      Qui doit combien à qui
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Vue nette du mois en séparant les dépenses avancées par un membre et celles payées via le compte commun.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Écritures retenues
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {snapshot?.summary.entriesCount || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)]">
                  <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-3">
                      <ArrowRightLeft className="h-5 w-5 text-sky-700" />
                      <p className="text-lg font-semibold text-slate-950">Transferts entre membres</p>
                    </div>

                    <div className="mt-4 space-y-3">
                      {snapshot?.transfers.length ? (
                        snapshot.transfers.map((transfer, index) => (
                          <div key={`${transfer.fromMemberId}-${transfer.toMemberId}-${index}`} className="rounded-2xl bg-white px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {transfer.fromLabel} doit verser {formatCurrency(transfer.amount, 2)} à {transfer.toLabel}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                          Les dépenses payées directement sont déjà équilibrées sur la période.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-3">
                      <Coins className="h-5 w-5 text-amber-700" />
                      <p className="text-lg font-semibold text-slate-950">Compte commun</p>
                    </div>

                    {selectedGroup.shared_account_enabled ? (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl bg-white px-4 py-4">
                          <p className="text-sm text-slate-500">Solde déclaré</p>
                          <p className="mt-1 text-2xl font-semibold text-slate-950">
                            {formatCurrency(snapshot?.summary.sharedAccountBalance || 0, 2)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-4">
                          <p className="text-sm text-slate-500">Reste à alimenter</p>
                          <p className="mt-1 text-2xl font-semibold text-amber-700">
                            {formatCurrency(snapshot?.summary.sharedAccountTopUpNeeded || 0, 2)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {snapshot?.members.map((member) => (
                            <div key={member.id} className="rounded-2xl bg-white px-4 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">{member.display_name}</p>
                                  <p className="text-sm text-slate-500">
                                    attendu {formatCurrency(member.expectedSharedContribution, 2)} • déjà versé {formatCurrency(member.fundedSharedContribution, 2)}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-slate-900">
                                  top-up conseillé {formatCurrency(member.topUpRecommendation, 2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                        Ce groupe fonctionne sans compte commun pour le moment.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200/80 bg-white/92 p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <ReceiptText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Nouvelle écriture
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-950">Ajouter une dépense ou un versement</h2>
                  </div>
                </div>

                <form onSubmit={handleCreateEntry} className="mt-5 grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Type</span>
                    <select
                      value={entryForm.entry_type}
                      onChange={(event) =>
                        setEntryForm((current) => ({
                          ...current,
                          entry_type: event.target.value,
                          paid_from: event.target.value === 'funding' ? 'member' : current.paid_from,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                    >
                      <option value="expense">Dépense partagée</option>
                      <option value="funding">Alimentation du compte commun</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Montant</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={entryForm.amount}
                      onChange={(event) =>
                        setEntryForm((current) => ({
                          ...current,
                          amount: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                      placeholder="0.00"
                    />
                  </label>

                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">Description</span>
                    <input
                      required
                      value={entryForm.description}
                      onChange={(event) =>
                        setEntryForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                      placeholder="Loyer, courses, virement de couverture..."
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Date</span>
                    <input
                      type="date"
                      required
                      value={entryForm.entry_date}
                      onChange={(event) =>
                        setEntryForm((current) => ({
                          ...current,
                          entry_date: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {entryForm.entry_type === 'funding' ? 'Versement effectué par' : 'Payé par'}
                    </span>
                    <select
                      required
                      value={entryForm.paid_by_member_id}
                      onChange={(event) =>
                        setEntryForm((current) => ({
                          ...current,
                          paid_by_member_id: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                    >
                      {selectedGroup.members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.display_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {entryForm.entry_type === 'expense' && (
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Source du paiement</span>
                      <select
                        value={entryForm.paid_from}
                        onChange={(event) =>
                          setEntryForm((current) => ({
                            ...current,
                            paid_from: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                      >
                        <option value="member">Paiement direct par un membre</option>
                        {selectedGroup.shared_account_enabled && (
                          <option value="shared_account">
                            Paiement depuis {selectedGroup.shared_account_name || 'le compte commun'}
                          </option>
                        )}
                      </select>
                    </label>
                  )}

                  <label className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={entryForm.is_recurring}
                      onChange={(event) =>
                        setEntryForm((current) => ({
                          ...current,
                          is_recurring: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-sky-600"
                    />
                    Écriture récurrente
                  </label>

                  {entryForm.is_recurring && (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">Fréquence</span>
                        <select
                          value={entryForm.recurrence_pattern}
                          onChange={(event) =>
                            setEntryForm((current) => ({
                              ...current,
                              recurrence_pattern: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                        >
                          <option value="weekly">Hebdomadaire</option>
                          <option value="monthly">Mensuelle</option>
                          <option value="quarterly">Trimestrielle</option>
                          <option value="yearly">Annuelle</option>
                        </select>
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700">Date de fin</span>
                        <input
                          type="date"
                          value={entryForm.recurrence_end_date}
                          onChange={(event) =>
                            setEntryForm((current) => ({
                              ...current,
                              recurrence_end_date: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                        />
                      </label>
                    </>
                  )}

                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">Notes</span>
                    <textarea
                      value={entryForm.notes}
                      onChange={(event) =>
                        setEntryForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      rows="3"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-300"
                      placeholder="Exemple: moitié-moitié, prélèvement fixe, régularisation..."
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={entrySubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60 lg:w-fit"
                  >
                    <Plus className="h-4 w-4" />
                    {entrySubmitting ? 'Enregistrement...' : 'Ajouter l’écriture'}
                  </button>
                </form>
              </section>

              <section className="rounded-[32px] border border-slate-200/80 bg-white/92 p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <ReceiptText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Détail du mois
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-950">Écritures prises dans le calcul</h2>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {snapshot?.entries.length ? (
                    snapshot.entries.map((entry) => (
                      <div key={`${entry.id}-${entry.entry_date}-${entry.is_occurrence ? 'occ' : 'base'}`} className="rounded-[26px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{entry.description}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {entry.entry_date} • {entry.sourceLabel}
                              {entry.is_occurrence ? ' • occurrence récurrente' : ''}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {entry.shareBreakdown.map((share) => (
                                <span key={`${entry.id}-${share.memberId}`} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                  {share.member?.display_name || 'Membre'}: {formatCurrency(share.amount, 2)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-semibold text-slate-950">
                              {formatCurrency(entry.amount, 2)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {entry.entry_type === 'funding' ? 'Versement' : 'Dépense'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-sm text-slate-500">
                      Aucune écriture sur cette période. Ajoutez une dépense de groupe ou une alimentation du compte commun pour démarrer.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
