import api from './api';

export const dashboardService = {
  // Récupérer le dashboard actuel de l'utilisateur
  getDashboard: async () => {
    try {
      const response = await api.get('/dashboards/current');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération dashboard:', error);
      throw error;
    }
  },

  // Récupérer les données du tableau de bord (transactions, budgets, etc.)
  getDashboardData: async (accountId) => {
    try {
      const response = await api.get(`/accounts/${accountId}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération données dashboard:', error);
      throw error;
    }
  },

  // Ajouter une transaction
  addTransaction: async (accountId, transactionData) => {
    try {
      const response = await api.post('/transactions', {
        account_id: accountId,
        ...transactionData
      });
      return response.data;
    } catch (error) {
      console.error('Erreur ajout transaction:', error);
      throw error;
    }
  },

  // Récupérer les transactions d'un compte
  getTransactions: async (accountId, filters = {}) => {
    try {
      const response = await api.get(`/accounts/${accountId}/transactions`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération transactions:', error);
      throw error;
    }
  },

  // Récupérer les budgets d'un compte
  getBudgets: async (accountId) => {
    try {
      const response = await api.get(`/accounts/${accountId}/budgets`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération budgets:', error);
      throw error;
    }
  },

  // Créer un nouveau budget
  createBudget: async (accountId, budgetData) => {
    try {
      const response = await api.post('/budgets', {
        account_id: accountId,
        ...budgetData
      });
      return response.data;
    } catch (error) {
      console.error('Erreur création budget:', error);
      throw error;
    }
  },

  // Récupérer les catégories d'un compte
  getCategories: async (accountId) => {
    try {
      const response = await api.get(`/accounts/${accountId}/categories`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération catégories:', error);
      throw error;
    }
  },

  // Créer une nouvelle catégorie
  createCategory: async (accountId, categoryData) => {
    try {
      const response = await api.post('/categories', {
        account_id: accountId,
        ...categoryData
      });
      return response.data;
    } catch (error) {
      console.error('Erreur création catégorie:', error);
      throw error;
    }
  },

  // Récupérer les comptes partagés
  getSharedAccounts: async () => {
    try {
      const response = await api.get('/accounts/shared');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération comptes partagés:', error);
      throw error;
    }
  }
};