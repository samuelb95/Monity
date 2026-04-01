function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toIsoDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

function addRecurrence(date, pattern) {
  const nextDate = new Date(date);

  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'bi-weekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'semi-annually':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
}

function isDateWithinRange(date, start, end) {
  const current = new Date(date);
  return current >= start && current <= end;
}

function distributeAmountByWeights(amount, members) {
  if (!members.length) return [];

  const safeMembers = members.map((member) => ({
    ...member,
    share_ratio: Math.max(0.0001, toNumber(member.share_ratio, 1)),
  }));

  const totalWeight = safeMembers.reduce((sum, member) => sum + member.share_ratio, 0);
  const totalCents = Math.round(toNumber(amount) * 100);

  const provisional = safeMembers.map((member) => {
    const rawCents = (totalCents * member.share_ratio) / totalWeight;
    const baseCents = Math.floor(rawCents);

    return {
      member,
      baseCents,
      remainder: rawCents - baseCents,
    };
  });

  let assignedCents = provisional.reduce((sum, item) => sum + item.baseCents, 0);
  let remainingCents = totalCents - assignedCents;

  provisional
    .sort((left, right) => right.remainder - left.remainder)
    .forEach((item) => {
      if (remainingCents <= 0) return;
      item.baseCents += 1;
      remainingCents -= 1;
    });

  return provisional
    .sort((left, right) => {
      const leftDate = left.member.created_at ? new Date(left.member.created_at).getTime() : 0;
      const rightDate = right.member.created_at ? new Date(right.member.created_at).getTime() : 0;
      return leftDate - rightDate;
    })
    .map((item) => ({
      memberId: item.member.id,
      amount: item.baseCents / 100,
    }));
}

export function expandExpenseGroupEntries(entries, selectedDate = new Date()) {
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);

  return (entries || [])
    .flatMap((entry) => {
      const baseDate = entry.entry_date ? new Date(entry.entry_date) : new Date();
      const recurrenceEnd = entry.recurrence_end_date ? new Date(entry.recurrence_end_date) : null;

      if (!entry.is_recurring) {
        return isDateWithinRange(baseDate, monthStart, monthEnd)
          ? [{ ...entry, entry_date: toIsoDate(baseDate), is_occurrence: false }]
          : [];
      }

      const occurrences = [];
      let currentDate = new Date(baseDate);

      while (currentDate < monthStart) {
        currentDate = addRecurrence(currentDate, entry.recurrence_pattern);
        if (recurrenceEnd && currentDate > recurrenceEnd) {
          return [];
        }
      }

      while (currentDate <= monthEnd) {
        if (recurrenceEnd && currentDate > recurrenceEnd) {
          break;
        }

        occurrences.push({
          ...entry,
          entry_date: toIsoDate(currentDate),
          is_occurrence: true,
        });

        currentDate = addRecurrence(currentDate, entry.recurrence_pattern);
      }

      return occurrences;
    })
    .sort((left, right) => new Date(right.entry_date) - new Date(left.entry_date));
}

function buildTransferPlan(balanceMap, memberMap) {
  const creditors = [];
  const debtors = [];

  Object.entries(balanceMap).forEach(([memberId, amount]) => {
    const roundedAmount = Math.round(toNumber(amount) * 100) / 100;
    if (roundedAmount > 0.009) {
      creditors.push({ memberId, amount: roundedAmount });
    } else if (roundedAmount < -0.009) {
      debtors.push({ memberId, amount: Math.abs(roundedAmount) });
    }
  });

  creditors.sort((left, right) => right.amount - left.amount);
  debtors.sort((left, right) => right.amount - left.amount);

  const transfers = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Math.min(creditor.amount, debtor.amount);

    transfers.push({
      fromMemberId: debtor.memberId,
      fromLabel: memberMap.get(debtor.memberId)?.display_name || 'Membre',
      toMemberId: creditor.memberId,
      toLabel: memberMap.get(creditor.memberId)?.display_name || 'Membre',
      amount: Math.round(amount * 100) / 100,
    });

    creditor.amount = Math.round((creditor.amount - amount) * 100) / 100;
    debtor.amount = Math.round((debtor.amount - amount) * 100) / 100;

    if (creditor.amount <= 0.009) creditorIndex += 1;
    if (debtor.amount <= 0.009) debtorIndex += 1;
  }

  return transfers;
}

export function buildExpenseGroupSnapshot(group, members, entries, selectedDate = new Date()) {
  const safeMembers = (members || []).map((member) => ({
    ...member,
    share_ratio: Math.max(0.0001, toNumber(member.share_ratio, 1)),
  }));
  const memberMap = new Map(safeMembers.map((member) => [member.id, member]));
  const monthEntries = expandExpenseGroupEntries(entries, selectedDate);
  const totalWeight = safeMembers.reduce((sum, member) => sum + member.share_ratio, 0) || 1;

  const directBalanceByMember = {};
  const directPaidByMember = {};
  const sharedExpectedByMember = {};
  const sharedFundedByMember = {};

  safeMembers.forEach((member) => {
    directBalanceByMember[member.id] = 0;
    directPaidByMember[member.id] = 0;
    sharedExpectedByMember[member.id] = 0;
    sharedFundedByMember[member.id] = 0;
  });

  let totalExpenses = 0;
  let directExpenses = 0;
  let sharedAccountExpenses = 0;
  let fundingEntriesTotal = 0;

  const resolvedEntries = monthEntries.map((entry) => {
    const amount = toNumber(entry.amount);
    const paidByMember = entry.paid_by_member_id ? memberMap.get(entry.paid_by_member_id) || null : null;
    const shareBreakdown = distributeAmountByWeights(amount, safeMembers).map((share) => ({
      ...share,
      member: memberMap.get(share.memberId) || null,
    }));

    if (entry.entry_type === 'expense') {
      totalExpenses += amount;

      if (entry.paid_from === 'shared_account') {
        sharedAccountExpenses += amount;
        shareBreakdown.forEach((share) => {
          sharedExpectedByMember[share.memberId] += share.amount;
        });
      } else if (paidByMember) {
        directExpenses += amount;
        directPaidByMember[paidByMember.id] += amount;
        directBalanceByMember[paidByMember.id] += amount;
        shareBreakdown.forEach((share) => {
          directBalanceByMember[share.memberId] -= share.amount;
        });
      }
    }

    if (entry.entry_type === 'funding' && paidByMember) {
      fundingEntriesTotal += amount;
      sharedFundedByMember[paidByMember.id] += amount;
    }

    return {
      ...entry,
      amount,
      paidByMember,
      shareBreakdown,
      sourceLabel:
        entry.entry_type === 'funding'
          ? 'Alimentation du compte commun'
          : entry.paid_from === 'shared_account'
            ? group?.shared_account_name || 'Compte commun'
            : paidByMember?.display_name || 'Paiement membre',
    };
  });

  const sharedAccountBalance = toNumber(group?.shared_account_balance);
  const sharedAccountTopUpNeeded = group?.shared_account_enabled
    ? Math.max(Math.round((sharedAccountExpenses - sharedAccountBalance) * 100) / 100, 0)
    : 0;

  const memberRows = safeMembers.map((member) => {
    const expectedShared = Math.round(sharedExpectedByMember[member.id] * 100) / 100;
    const fundedShared = Math.round(sharedFundedByMember[member.id] * 100) / 100;
    const sharedDelta = Math.round((fundedShared - expectedShared) * 100) / 100;
    const topUpRecommendation =
      group?.shared_account_enabled && sharedAccountExpenses > 0
        ? Math.round((sharedAccountTopUpNeeded * expectedShared / sharedAccountExpenses) * 100) / 100
        : 0;

    return {
      ...member,
      sharePercentage: Math.round((member.share_ratio / totalWeight) * 100),
      directBalance: Math.round(directBalanceByMember[member.id] * 100) / 100,
      directPaid: Math.round(directPaidByMember[member.id] * 100) / 100,
      expectedSharedContribution: expectedShared,
      fundedSharedContribution: fundedShared,
      sharedContributionDelta: sharedDelta,
      topUpRecommendation,
    };
  });

  const transfers = buildTransferPlan(directBalanceByMember, memberMap);

  return {
    group,
    members: memberRows,
    entries: resolvedEntries,
    transfers,
    summary: {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      directExpenses: Math.round(directExpenses * 100) / 100,
      sharedAccountExpenses: Math.round(sharedAccountExpenses * 100) / 100,
      fundingEntriesTotal: Math.round(fundingEntriesTotal * 100) / 100,
      sharedAccountBalance,
      sharedAccountTopUpNeeded,
      entriesCount: resolvedEntries.length,
    },
  };
}
