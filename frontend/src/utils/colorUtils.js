/**
 * Utility functions for dynamic color management
 */

export const getBalanceColor = (balance) => {
  if (balance > 0) {
    return {
      text: 'text-success-600',
      bg: 'bg-success-50',
      border: 'border-success-500',
      variable: 'var(--color-status-positive)',
      card: 'card-positive',
    };
  } else if (balance < 0) {
    return {
      text: 'text-danger-600',
      bg: 'bg-danger-50',
      border: 'border-danger-500',
      variable: 'var(--color-status-negative)',
      card: 'card-negative',
    };
  }
  return {
    text: 'text-neutral-600',
    bg: 'bg-neutral-50',
    border: 'border-neutral-400',
    variable: 'var(--color-status-neutral)',
    card: 'card-neutral',
  };
};

export const getBudgetProgressColor = (percentage) => {
  if (percentage <= 50) {
    return { text: 'text-success-600', bg: 'bg-success-500', variable: 'var(--color-status-positive)' };
  } else if (percentage <= 80) {
    return { text: 'text-warning-600', bg: 'bg-warning-500', variable: 'var(--color-status-pending)' };
  }
  return { text: 'text-danger-600', bg: 'bg-danger-500', variable: 'var(--color-status-negative)' };
};

export const getCategoryColor = (categoryName) => {
  const categoryMap = {
    charges: 'var(--color-category-charges)',
    savings: 'var(--color-category-savings)',
    entertainment: 'var(--color-category-entertainment)',
    health: 'var(--color-category-health)',
    transport: 'var(--color-category-transport)',
    food: 'var(--color-category-food)',
    utilities: 'var(--color-category-utilities)',
    education: 'var(--color-category-education)',
  };
  
  return categoryMap[categoryName?.toLowerCase()] || categoryMap.utilities;
};

export const getTransactionTypeColor = (type) => {
  if (type === 'income' || type === 'revenue') {
    return {
      text: 'text-success-600',
      bg: 'bg-success-50',
      border: 'border-success-500',
      variable: 'var(--color-status-positive)',
    };
  }
  return {
    text: 'text-danger-600',
    bg: 'bg-danger-50',
    border: 'border-danger-500',
    variable: 'var(--color-status-negative)',
  };
};

export const getStatusColor = (status) => {
  const statusMap = {
    pending: { text: 'text-warning-600', bg: 'bg-warning-50', border: 'border-warning-500' },
    completed: { text: 'text-success-600', bg: 'bg-success-50', border: 'border-success-500' },
    failed: { text: 'text-danger-600', bg: 'bg-danger-50', border: 'border-danger-500' },
    active: { text: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-500' },
  };
  
  return statusMap[status?.toLowerCase()] || statusMap.active;
};

export const getAccountTypeColor = (type) => {
  const typeMap = {
    personal: 'var(--color-primary-500)',
    shared: 'var(--color-secondary-500)',
    savings: 'var(--color-success-500)',
    group: 'var(--color-warning-500)',
  };
  
  return typeMap[type?.toLowerCase()] || typeMap.personal;
};