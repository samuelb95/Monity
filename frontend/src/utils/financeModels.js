import { generateRecurringOccurrences, getDescendantCategoryIds } from '../services/supabaseService';

const STORAGE_KEY = 'monity-allocation-targets';

export const allocationBuckets = [
  {
    key: 'essentials',
    label: 'Essentiels',
    shortLabel: 'Essentiels',
    color: '#0ea5e9',
    defaultValue: 45,
    description: 'Loyer, transport, factures, alimentation utile.',
  },
  {
    key: 'lifestyle',
    label: 'Vie courante',
    shortLabel: 'Vie',
    color: '#8b5cf6',
    defaultValue: 25,
    description: 'Sorties, confort, loisirs et dépenses flexibles.',
  },
  {
    key: 'goals',
    label: 'Objectifs',
    shortLabel: 'Objectifs',
    color: '#14b8a6',
    defaultValue: 20,
    description: 'Épargne dédiée à vos projets et à vos objectifs.',
  },
  {
    key: 'buffer',
    label: 'Marge',
    shortLabel: 'Marge',
    color: '#f59e0b',
    defaultValue: 10,
    description: 'Sécurité, imprévus et respiration du budget.',
  },
];

const essentialKeywords = [
  'loyer',
  'rent',
  'edf',
  'eau',
  'gaz',
  'electric',
  'internet',
  'phone',
  'telephone',
  'assurance',
  'transport',
  'essence',
  'carburant',
  'course',
  'courses',
  'supermarch',
  'pharmacie',
  'sante',
  'santé',
  'mutuelle',
  'credit',
  'prêt',
  'pret',
  'taxe',
  'impot',
  'impôt',
];

export function formatCurrency(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits,
  }).format(value || 0);
}

export function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getMonthTransactions(transactions, selectedDate) {
  return (transactions || []).filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === selectedDate.getMonth() &&
      transactionDate.getFullYear() === selectedDate.getFullYear()
    );
  });
}

export function summarizeTransactions(transactions) {
  return (transactions || []).reduce(
    (summary, transaction) => {
      if (transaction.type === 'income') {
        summary.income += transaction.amount || 0;
        if (transaction.is_recurring) {
          summary.recurringIncome += transaction.amount || 0;
        }
      } else {
        summary.expenses += transaction.amount || 0;
        if (transaction.is_recurring) {
          summary.recurringExpenses += transaction.amount || 0;
        }
      }

      if (transaction.is_validated) {
        summary.validated += 1;
      }

      return summary;
    },
    {
      income: 0,
      expenses: 0,
      recurringIncome: 0,
      recurringExpenses: 0,
      validated: 0,
    }
  );
}

export function getMonthlyAverage(transactions, type, monthsBack = 3) {
  const now = new Date();
  const buckets = [];

  for (let index = 0; index < monthsBack; index += 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const filtered = (transactions || []).filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transaction.type === type &&
        transactionDate.getMonth() === month.getMonth() &&
        transactionDate.getFullYear() === month.getFullYear()
      );
    });

    const total = filtered.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    buckets.push(total);
  }

  if (!buckets.length) return 0;
  return buckets.reduce((sum, value) => sum + value, 0) / buckets.length;
}

export function getStoredAllocationTargets() {
  if (typeof window === 'undefined') {
    return allocationBuckets.map(({ key, defaultValue }) => ({ key, value: defaultValue }));
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return allocationBuckets.map(({ key, defaultValue }) => ({ key, value: defaultValue }));
    }

    const parsed = JSON.parse(rawValue);
    const base = allocationBuckets.map(({ key, defaultValue }) => ({
      key,
      value: parsed?.find((item) => item.key === key)?.value ?? defaultValue,
    }));

    return normalizeTargets(base);
  } catch (error) {
    console.error('Erreur lecture allocation targets:', error);
    return allocationBuckets.map(({ key, defaultValue }) => ({ key, value: defaultValue }));
  }
}

export function saveStoredAllocationTargets(targets) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeTargets(targets)));
  } catch (error) {
    console.error('Erreur sauvegarde allocation targets:', error);
  }
}

export function normalizeTargets(targets) {
  const safeTargets = targets.map((item) => ({
    key: item.key,
    value: Math.max(0, Math.round(item.value)),
  }));

  const total = safeTargets.reduce((sum, item) => sum + item.value, 0);

  if (total === 100) {
    return safeTargets;
  }

  if (total === 0) {
    return allocationBuckets.map(({ key, defaultValue }) => ({ key, value: defaultValue }));
  }

  const normalized = safeTargets.map((item) => ({
    key: item.key,
    value: Math.round((item.value / total) * 100),
  }));

  const diff = 100 - normalized.reduce((sum, item) => sum + item.value, 0);
  normalized[normalized.length - 1].value += diff;

  return normalized;
}

export function updateTargetsWithRedistribution(targets, changedKey, nextValue) {
  const currentTargets = normalizeTargets(targets);
  const boundedValue = Math.max(0, Math.min(100, Math.round(nextValue)));
  const currentValue = currentTargets.find((item) => item.key === changedKey)?.value ?? 0;
  const delta = boundedValue - currentValue;

  if (delta === 0) {
    return currentTargets;
  }

  const remainingTargets = currentTargets.filter((item) => item.key !== changedKey);
  const remainingTotal = remainingTargets.reduce((sum, item) => sum + item.value, 0);

  const redistributed = currentTargets.map((item) => {
    if (item.key === changedKey) {
      return { ...item, value: boundedValue };
    }

    if (remainingTotal === 0) {
      return { ...item, value: Math.max(0, Math.round((100 - boundedValue) / remainingTargets.length)) };
    }

    const ratio = item.value / remainingTotal;
    const adjustedValue = Math.max(0, Math.round(item.value - delta * ratio));
    return { ...item, value: adjustedValue };
  });

  return normalizeTargets(redistributed);
}

function classifyTransaction(transaction) {
  if (transaction.type === 'income') {
    return 'income';
  }

  if (transaction.savings_goal_id) {
    return 'goals';
  }

  const categoryName = transaction.categories?.name || '';
  const descriptor = `${transaction.description || ''} ${categoryName}`.toLowerCase();

  if (transaction.is_recurring || essentialKeywords.some((keyword) => descriptor.includes(keyword))) {
    return 'essentials';
  }

  return 'lifestyle';
}

export function buildAllocationModel(transactions, balances, targets) {
  const summary = summarizeTransactions(transactions);
  const income = Math.max(summary.income, 1);
  const currentTargets = normalizeTargets(targets);

  const actual = {
    essentials: 0,
    lifestyle: 0,
    goals: 0,
    buffer: Math.max((balances?.availableBalance || 0) > 0 ? balances.availableBalance : 0, 0),
  };

  (transactions || []).forEach((transaction) => {
    if (transaction.type !== 'expense') return;
    const bucket = classifyTransaction(transaction);
    actual[bucket] += transaction.amount || 0;
  });

  const actualTotal = actual.essentials + actual.lifestyle + actual.goals;
  const leftover = Math.max(summary.income - actualTotal, 0);
  actual.buffer = leftover;

  return allocationBuckets.map((bucket) => {
    const actualAmount = actual[bucket.key] || 0;
    const targetValue = currentTargets.find((item) => item.key === bucket.key)?.value ?? bucket.defaultValue;
    const targetAmount = (summary.income * targetValue) / 100;
    const delta = actualAmount - targetAmount;

    return {
      ...bucket,
      targetValue,
      targetAmount,
      actualAmount,
      actualRatio: summary.income > 0 ? (actualAmount / income) * 100 : 0,
      delta,
    };
  });
}

export function buildBudgetPressure(budgets, categories, transactions, totalIncome) {
  return (budgets || [])
    .map((budget) => {
      const effectiveLimit =
        budget.limit_type === 'percentage'
          ? ((budget.limit_amount || 0) / 100) * totalIncome
          : budget.limit_amount || 0;

      const categoryIds = budget.category_id
        ? getDescendantCategoryIds(budget.category_id, categories || [])
        : null;

      const spent = (transactions || [])
        .filter((transaction) => transaction.type === 'expense')
        .filter((transaction) => {
          if (!categoryIds) return true;
          return categoryIds.includes(transaction.category_id);
        })
        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

      const ratio = effectiveLimit > 0 ? (spent / effectiveLimit) * 100 : 0;

      return {
        ...budget,
        spent,
        effectiveLimit,
        ratio,
        remaining: effectiveLimit - spent,
      };
    })
    .sort((left, right) => right.ratio - left.ratio);
}

export function buildProjectionSeries(account, allTransactions, savingsGoals, startDate = new Date(), months = 6) {
  const baseDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  let rollingBalance = account?.current_balance || 0;
  const virtualSavings = (savingsGoals || [])
    .filter((goal) => !goal.is_physical && goal.is_active)
    .reduce((sum, goal) => sum + (goal.current_amount || 0), 0);

  const averageOneOffNet = getAverageNonRecurringNet(allTransactions);

  return Array.from({ length: months }).map((_, index) => {
    const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + index, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    let recurringNet = 0;

    (allTransactions || []).forEach((transaction) => {
      if (!transaction.is_recurring) return;

      const occurrences = generateRecurringOccurrences(transaction, monthStart, monthEnd);
      occurrences.forEach((occurrence) => {
        recurringNet += transaction.type === 'income' ? occurrence.amount : -occurrence.amount;
      });
    });

    rollingBalance += recurringNet + averageOneOffNet;

    return {
      label: new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(monthDate),
      monthDate,
      projectedBalance: rollingBalance,
      availableBalance: rollingBalance - virtualSavings,
      recurringNet,
    };
  });
}

function getAverageNonRecurringNet(transactions, months = 3) {
  const now = new Date();
  const monthlyValues = [];

  for (let index = 1; index <= months; index += 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const monthNet = (transactions || [])
      .filter((transaction) => !transaction.is_recurring)
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === monthDate.getMonth() &&
          transactionDate.getFullYear() === monthDate.getFullYear()
        );
      })
      .reduce((sum, transaction) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, 0);

    monthlyValues.push(monthNet);
  }

  if (!monthlyValues.length) return 0;
  return monthlyValues.reduce((sum, value) => sum + value, 0) / monthlyValues.length;
}

export function buildGoalForecasts(goals, allTransactions, monthlyCapacity, referenceDate = new Date()) {
  const activeGoals = (goals || []).filter((goal) => goal.is_active);

  if (!activeGoals.length) return [];

  const defaultShare = monthlyCapacity > 0 ? monthlyCapacity / activeGoals.length : 0;

  return activeGoals
    .map((goal) => {
      const remaining = Math.max((goal.target_amount || 0) - (goal.current_amount || 0), 0);
      const historicalContribution = getAverageGoalContribution(allTransactions, goal.id);
      const targetDate = goal.target_date ? new Date(goal.target_date) : null;

      let requiredMonthly = null;
      if (targetDate) {
        const monthsUntilTarget = Math.max(
          1,
          (targetDate.getFullYear() - referenceDate.getFullYear()) * 12 +
            (targetDate.getMonth() - referenceDate.getMonth()) +
            1
        );
        requiredMonthly = remaining / monthsUntilTarget;
      }

      const suggestedMonthly = requiredMonthly || Math.max(defaultShare, historicalContribution || 0);
      const effectiveMonthly = historicalContribution > 0 ? historicalContribution : suggestedMonthly;
      const monthsToGoal = effectiveMonthly > 0 ? Math.ceil(remaining / effectiveMonthly) : null;
      const projectedDate = monthsToGoal
        ? new Date(referenceDate.getFullYear(), referenceDate.getMonth() + monthsToGoal, 1)
        : null;

      let status = 'stable';
      if (requiredMonthly && suggestedMonthly < requiredMonthly) {
        status = 'stretch';
      } else if (requiredMonthly && suggestedMonthly >= requiredMonthly) {
        status = 'on-track';
      } else if (!requiredMonthly && effectiveMonthly > 0) {
        status = 'momentum';
      }

      return {
        ...goal,
        remaining,
        historicalContribution,
        requiredMonthly,
        suggestedMonthly,
        monthsToGoal,
        projectedDate,
        status,
      };
    })
    .sort((left, right) => {
      const leftDate = left.projectedDate ? left.projectedDate.getTime() : Number.POSITIVE_INFINITY;
      const rightDate = right.projectedDate ? right.projectedDate.getTime() : Number.POSITIVE_INFINITY;
      return leftDate - rightDate;
    });
}

function getAverageGoalContribution(transactions, goalId, months = 3) {
  const now = new Date();
  const values = [];

  for (let index = 0; index < months; index += 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const total = (transactions || [])
      .filter((transaction) => transaction.savings_goal_id === goalId && transaction.type === 'expense')
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === monthDate.getMonth() &&
          transactionDate.getFullYear() === monthDate.getFullYear()
        );
      })
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

    values.push(total);
  }

  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildGoalSimulator(goal, monthlyContribution, referenceDate = new Date()) {
  if (!goal) return null;

  const remaining = Math.max((goal.target_amount || 0) - (goal.current_amount || 0), 0);
  const safeContribution = Math.max(0, monthlyContribution || 0);

  if (safeContribution === 0) {
    return {
      remaining,
      months: null,
      projectedDate: null,
    };
  }

  const months = Math.ceil(remaining / safeContribution);
  return {
    remaining,
    months,
    projectedDate: new Date(referenceDate.getFullYear(), referenceDate.getMonth() + months, 1),
  };
}
